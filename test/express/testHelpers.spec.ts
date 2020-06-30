import { stubMiddleware, stubClient } from '../../src/express/testHelpers'
import httpMocks from 'node-mocks-http'
import { Request, NextFunction } from 'express-serve-static-core'
import { Toggle } from '../../src/models/Toggle'
import { ToggleState } from '../../src/models/ToggleState'

describe('Test Helpers', () => {
    describe('stubMiddleware', () => {
        const sendMiddlewareRequest = (togglesState: ToggleState[]) => {
            const request: Request = httpMocks.createRequest()
            const fakeNext = jest.fn<NextFunction, []>()

            stubMiddleware(togglesState)(request, httpMocks.createResponse(), fakeNext)
            return request
        }

        const someToggle: Toggle = { id: 'some-toggle', default: true }

        it('should return the state provided in the overrides', () => {
            const req = sendMiddlewareRequest([{ id: 'some-toggle', enabled: false }])
            expect(req.toguru?.isToggleEnabled(someToggle)).toEqual(false)
        })

        it('should return the default state id no override is provided', () => {
            const req = sendMiddlewareRequest([])
            expect(req.toguru?.isToggleEnabled(someToggle)).toEqual(someToggle.default)
        })
    })

    describe('stubClient', () => {
        const someToggle: Toggle = { id: 'some-toggle', default: true }

        const sendClientRequest = (togglesState: ToggleState[]) => stubClient(togglesState)(httpMocks.createRequest())

        it('should return the state provided in the overrides', () => {
            const toguru = sendClientRequest([{ id: 'some-toggle', enabled: false }])
            expect(toguru.isToggleEnabled(someToggle)).toEqual(false)
        })

        it('should return the default state id no override is provided', () => {
            const toguru = sendClientRequest([])
            expect(toguru.isToggleEnabled(someToggle)).toEqual(someToggle.default)
        })
    })
})
