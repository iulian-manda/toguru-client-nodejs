import { stubToguruMiddleware } from '../../src/express/testHelpers'
import { ToguruClient } from '../../src/client'
import httpMocks from 'node-mocks-http'
import { Request, NextFunction } from 'express'
import { Toggle } from '../../src/models/Toggle'
import { ToggleState } from '../../src/models/ToggleState'

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            toguru?: ToguruClient
        }
    }
}

const sendRequest = (togglesState: ToggleState[]) => {
    const request: Request = httpMocks.createRequest()
    const fakeNext = jest.fn<NextFunction, []>()

    stubToguruMiddleware(togglesState)(request, httpMocks.createResponse(), fakeNext)
    return request
}

describe('Test Helpers', () => {
    describe('stubToguruMiddleware', () => {
        const someToggle: Toggle = { id: 'some-toggle', default: true }

        it('should return the state provided in the overrides', () => {
            const req = sendRequest([{ id: 'some-toggle', enabled: false }])
            expect(req.toguru?.isToggleEnabled(someToggle)).toEqual(false)
        })

        it('should return the default state id no override is provided', () => {
            const req = sendRequest([])
            expect(req.toguru?.isToggleEnabled(someToggle)).toEqual(someToggle.default)
        })
    })
})
