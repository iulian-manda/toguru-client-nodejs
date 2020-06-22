import { Request, NextFunction } from 'express'
import { middleware as expressMiddleware } from '../../src/express/bridge'
import client from '../../src/client'
import { toguruData } from '../mocks/togglestate.fixture'
import { cookieValue, defaultForcedTogglesExtractor } from '../../src/express/extractors'
import { Toggle } from '../../src/models/Toggle'
import { Toggles } from '../../src/models/Toggles'
import httpMocks from 'node-mocks-http'

let clientRefreshRes: (_: void) => void

jest.mock('axios', () =>
    jest.fn().mockImplementation(() => {
        clientRefreshRes()
        return Promise.resolve({ data: toguruData })
    }),
)

const sendRequest = async ({
    uuid,
    culture,
    query,
}: {
    uuid: string
    culture: string
    query: Record<string, string>
}) => {
    const fakeRequest: Request = httpMocks.createRequest({
        headers: {
            cookie: `uid=${uuid};culture=${culture}`,
        },
        query: query || {},
    })

    const fakeNext = jest.fn<NextFunction, []>()

    const clientReady = new Promise((res) => {
        clientRefreshRes = res
    })

    const middleware = expressMiddleware({
        client: client({ endpoint: 'endpoint', refreshIntervalMs: 100000 }),
        extractors: {
            uuid: cookieValue('uid'),
            attributes: [{ attribute: 'culture', extractor: cookieValue('culture') }],
            forcedToggles: defaultForcedTogglesExtractor,
        },
    })

    await clientReady

    await middleware(fakeRequest, httpMocks.createResponse(), fakeNext)

    return fakeRequest
}

const toggles: Record<string, Toggle> = {
    rolledOutToEveryone: { id: 'rolled-out-to-everyone', default: false },
    rolledOutToHalfInDeOnly: { id: 'rolled-out-to-half-in-de-only', default: false },
    rolledOutToNone: { id: 'rolled-out-to-none', default: false },
}

const userInBucket22CultureDE = {
    culture: 'de-DE',
    uuid: '88248687-6dce-4759-a5c0-3945eedc2b48',
    query: {},
} // bucket: 22
const userInBucketb76CultureDE = {
    culture: 'de-DE',
    uuid: '721f87e2-cec9-4753-b3bb-d2ebe20dd317',
    query: {},
} // bucket: 76
const userInBucket22CultureIT = {
    culture: 'it-IT',
    uuid: '88248687-6dce-4759-a5c0-3945eedc2b48',
    query: {},
} // bucket: 22

describe('Express middleware', () => {
    it('userInBucket22CultureDE', async () => {
        const req = await sendRequest(userInBucket22CultureDE)

        expect(req.toguru).toBeDefined()
        expect(req.toguru?.isToggleEnabled(toggles.rolledOutToEveryone)).toBeTruthy()
        expect(req.toguru?.isToggleEnabled(toggles.rolledOutToHalfInDeOnly)).toBeTruthy()
    })

    it('userInBucketb76CultureDE', async () => {
        const req = await sendRequest(userInBucketb76CultureDE)

        expect(req.toguru).toBeDefined()
        expect(req.toguru?.isToggleEnabled(toggles.rolledOutToNone)).toBeFalsy()
        expect(req.toguru?.isToggleEnabled(toggles.rolledOutToHalfInDeOnly)).toBeFalsy()
    })

    it('togglesForService 1', async () => {
        const req = await sendRequest(userInBucket22CultureDE)

        expect(req.toguru).toBeDefined()
        expect(req.toguru?.togglesForService('service2')).toEqual(
            new Toggles([
                {
                    id: 'rolled-out-to-half-in-de-only',
                    enabled: true,
                },
                {
                    id: 'rolled-out-to-none',
                    enabled: false,
                },
            ]),
        )
    })

    it('togglesForService 2', async () => {
        const req = await sendRequest(userInBucket22CultureIT)

        expect(req.toguru?.togglesForService('service2')).toEqual(
            new Toggles([
                {
                    id: 'rolled-out-to-half-in-de-only',
                    enabled: false,
                },
                {
                    id: 'rolled-out-to-none',
                    enabled: false,
                },
            ]),
        )
    })

    it('toggleStringForService', async () => {
        const req = await sendRequest(userInBucket22CultureIT)

        expect(req.toguru).toBeDefined()
        expect(req.toguru?.togglesForService('service2').queryString).toEqual(
            'toguru=rolled-out-to-half-in-de-only%3Dfalse%7Crolled-out-to-none%3Dfalse',
        )
    })

    it('Forced toggles', async () => {
        const req = await sendRequest({
            ...userInBucketb76CultureDE,
            query: {
                toguru: 'rolled-out-to-none=true|rolled-out-to-half-in-de-only=true',
            },
        })

        expect(req.toguru).toBeDefined()
        expect(req.toguru?.isToggleEnabled(toggles.rolledOutToNone)).toBeTruthy()
        expect(req.toguru?.isToggleEnabled(toggles.rolledOutToHalfInDeOnly)).toBeTruthy()
    })
})
