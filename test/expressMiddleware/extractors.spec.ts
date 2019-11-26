import {
    fromCookie,
    fromHeader,
    togglesStringParser,
    defaultForcedTogglesExtractor,
} from '../../src/expressMiddleware/extractors'
import { Request } from 'express'

const fakeRequestWithCookie = (name: string, value = 'cookieValue'): Request =>
    ({
        headers: {
            cookie: `${name}=${value}`,
        },
    } as Request)

const fakeRequestWithHeaders = (headers: Record<string, string>): Request =>
    ({
        headers: { ...headers },
    } as Request)

const fakeRequestWithQueryParams = (query: Record<string, string>): Request =>
    ({
        query,
    } as Request)

describe('Extractors', () => {
    describe('fromCookie', () => {
        describe('should be able to extract the value', () => {
            const cookieName = 'cookieName'
            it('if present', () => {
                const cookieValue = fromCookie(cookieName)(fakeRequestWithCookie(cookieName))
                expect(cookieValue).toEqual('cookieValue')
            })
            it('if present with a name capitalized differently, with the caseInsensitiveOption', () => {
                const cookieValue = fromCookie(cookieName)(fakeRequestWithCookie('CooKieName'))
                expect(cookieValue).toEqual('cookieValue')
            })
        })

        it('should return null, if the cookie is not present', () => {
            const cookieValue = fromCookie('anotherCookieName')(fakeRequestWithCookie('cookieName'))
            expect(cookieValue).toBeNull()
        })
    })

    describe('fromHeader', () => {
        describe('should be able to extract the value', () => {
            it('if present', () => {
                const cookieValue = fromHeader('headerName')(fakeRequestWithHeaders({ headerName: 'headerValue' }))
                expect(cookieValue).toEqual('headerValue')
            })
            it('if present with a name capitalized differently, with the caseInsensitiveOption', () => {
                const cookieValue = fromHeader('headerName')(fakeRequestWithHeaders({ HeaderName: 'headerValue' }))
                expect(cookieValue).toEqual('headerValue')
            })
        })

        it('should return null, if not present', () => {
            const cookieValue = fromHeader('headerName')(fakeRequestWithHeaders({ otherHeaderName: 'headerValue' }))
            expect(cookieValue).toBeNull()
        })
    })

    describe('togglesStringParser', () => {
        it('should parse the toguru string', () => {
            const togglesString = 'toggle-1=true|toggle-2=false'
            expect(togglesStringParser(togglesString)).toEqual({
                'toggle-1': true,
                'toggle-2': false,
            })

            expect(togglesStringParser('')).toEqual({})
        })
    })

    describe('defaultForcedTogglesExtractor', () => {
        it('no toguru headers defined', () => {
            const res = defaultForcedTogglesExtractor(fakeRequestWithHeaders({ toguru: '' }))
            expect(res).toEqual({})
        })

        it('toguru headers defined', () => {
            const toguru = defaultForcedTogglesExtractor(fakeRequestWithHeaders({ toguru: 'toggle-1=true' }))
            expect(toguru).toEqual({ 'toggle-1': true })

            const xToguru = defaultForcedTogglesExtractor(fakeRequestWithHeaders({ 'x-toguru': 'toggle-1=true' }))
            expect(xToguru).toEqual({ 'toggle-1': true })
        })

        it('no toguru cookie defined', () => {
            const res = defaultForcedTogglesExtractor(fakeRequestWithCookie('cookieName'))
            expect(res).toEqual({})
        })

        it('toguru cookie defined', () => {
            const res = defaultForcedTogglesExtractor(fakeRequestWithCookie('toguru', 'toggle-1=true'))
            expect(res).toEqual({ 'toggle-1': true })
        })

        it('no toguru query param defined', () => {
            const res = defaultForcedTogglesExtractor(fakeRequestWithQueryParams({}))
            expect(res).toEqual({})
        })

        it('toguru query param defined', () => {
            const res = defaultForcedTogglesExtractor(fakeRequestWithQueryParams({ toguru: 'toggle-1=true' }))
            expect(res).toEqual({ 'toggle-1': true })
        })
    })
})
