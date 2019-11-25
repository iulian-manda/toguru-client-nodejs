import Client from '../src/client'
import mockedTogglestate from './togglestate.fixture.json'
import { Toggles } from '../src/models/Toggles'

const userInBucket22CultureDE = {
    attributes: { culture: 'de-DE' },
    uuid: '88248687-6dce-4759-a5c0-3945eedc2b48',
} // bucket: 22
const userInBucketb76CultureDE = {
    attributes: { culture: 'de-DE' },
    uuid: '721f87e2-cec9-4753-b3bb-d2ebe20dd317',
} // bucket: 76
const userInBucket22CultureIT = {
    attributes: { culture: 'it-IT' },
    uuid: '88248687-6dce-4759-a5c0-3945eedc2b48',
} // bucket: 22
const userInBucket22NoCulture = {
    uuid: '88248687-6dce-4759-a5c0-3945eedc2b48',
} // bucket: 22

const promiseFetchInitialData = Promise.resolve({ data: mockedTogglestate })
const waitForDataLoading = () => beforeAll(() => promiseFetchInitialData)
jest.mock('axios', () => {
    return jest.fn().mockImplementation(() => promiseFetchInitialData)
})

// TODO add edge cases
describe('Toguru Client', () => {
    describe('Basic usage', () => {
        const client = Client({
            endpoint: 'https://example.com/togglestate',
            refreshIntervalMs: 60 * 1000,
        })

        waitForDataLoading()

        test('given a toggle that is not defined on the backend, should return the default value defined', () => {
            expect(client.isToggleEnabled(userInBucket22CultureDE)({ id: 'not-defined', default: true })).toBe(true)
        })

        test('given a forced toggle, should return the forced value', () => {
            expect(
                client.isToggleEnabled({
                    ...userInBucket22CultureDE,
                    forcedToggles: { 'rolled-out-to-noone': true },
                })({ id: 'rolled-out-to-noone', default: false }),
            ).toBe(true)
        })

        test('given a toggle with rollout percentage 100 and no culture, should return true for everyone', () => {
            expect(
                client.isToggleEnabled(userInBucketb76CultureDE)({ id: 'rolled-out-to-everyone', default: false }),
            ).toBe(true)
            expect(
                client.isToggleEnabled(userInBucket22NoCulture)({ id: 'rolled-out-to-everyone', default: false }),
            ).toBe(true)
        })

        test('given a toggle rolled out 100 in de, should return false for a user with a different culture or no culture', () => {
            expect(
                client.isToggleEnabled(userInBucket22CultureIT)({ id: 'rolled-out-only-in-de', default: true }),
            ).toBe(false)
            expect(
                client.isToggleEnabled(userInBucket22NoCulture)({ id: 'rolled-out-only-in-de', default: true }),
            ).toBe(false)
        })

        test('given a toggle rolled out at 50% in de, should return true for a de user in a bucket lower than 50', () => {
            expect(
                client.isToggleEnabled(userInBucket22CultureDE)({
                    id: 'rolled-out-to-half-in-de-only',
                    default: false,
                }),
            ).toBe(true)
        })

        test('given a toggle rolled out at 50% in de, should return true for a de user in a bucket higher than 50', () => {
            expect(
                client.isToggleEnabled(userInBucketb76CultureDE)({
                    id: 'rolled-out-to-half-in-de-only',
                    default: false,
                }),
            ).toBe(false)
        })
    })

    describe('Advanced features', () => {
        const client = Client({
            endpoint: 'https://example.com/togglestate',
            refreshIntervalMs: 60 * 1000,
        })

        waitForDataLoading()

        test('toggleForService, should return the Toggles objet for the correct service', () => {
            expect(client.togglesForService(userInBucket22CultureDE)('service2')).toEqual(
                new Toggles([
                    { id: 'rolled-out-to-half-in-de-only', enabled: true },
                    { id: 'rolled-out-to-noone', enabled: false },
                ]),
            )
        })
    })
})
