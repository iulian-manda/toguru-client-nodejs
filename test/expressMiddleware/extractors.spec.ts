import { fromCookie, fromHeader, defaultForcedTogglesExtractor } from '../../src/expressMiddleware/extractors'
import { Request } from 'express'
import httpMocks from 'node-mocks-http'

const fakeRequestWithCookie = (name: string, value: string): Request =>
    httpMocks.createRequest({
        headers: {
            cookie: `${name}=${value}`,
        },
    })

const fakeRequestWithHeaders = (headers: Record<string, string>): Request =>
    httpMocks.createRequest({
        headers: { ...headers },
    })

const fakeRequestWithQueryParams = (query: Record<string, string>): Request =>
    httpMocks.createRequest({
        query,
    })

describe('Extractors', () => {
    describe('fromCookie', () => {
        const cookieName = 'cookieName'

        it('extracts value if present', () => {
            const cookieValue = fromCookie('cookieName')(fakeRequestWithCookie(cookieName, 'toggleName=true'))
            expect(cookieValue).toEqual({ toggleName: true })
        })
        it('extracts value if present with a name capitalized differently', () => {
            const cookieValue = fromCookie(cookieName.toUpperCase())(
                fakeRequestWithCookie(cookieName.toLowerCase(), 'toggleName=false'),
            )
            expect(cookieValue).toEqual({ toggleName: false })
        })

        it('doesnt extract a value, if the cookie is not present', () => {
            const cookieValue = fromCookie('anotherCookieName')(fakeRequestWithCookie('cookieName', 'k=v'))
            expect(cookieValue).toEqual({})
        })
    })

    describe('fromHeader', () => {
        it('it extracts value if present', () => {
            const value = fromHeader('foo')(fakeRequestWithHeaders({ foo: 'bar=true|baz=false' }))
            expect(value).toEqual({ bar: true, baz: false })
        })
        it('it extracts value if present with a name capitalized differently', () => {
            const value = fromHeader('foo')(fakeRequestWithHeaders({ foo: 'bar=false|x=true' }))
            expect(value).toEqual({ bar: false, x: true })
        })

        it('doesnt extract a value, if header not present', () => {
            const value = fromHeader('foo')(fakeRequestWithHeaders({ otherHeaderName: 'baz=true' }))
            expect(value).toEqual({})
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
            const res = defaultForcedTogglesExtractor(fakeRequestWithCookie('cookieName', ''))
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

        it('combines overrides from different channels and prioritizes them according to `QueryParam -> Header -> Cookie`', () => {
            const requestWithCookieHeaderAndQueryParamOverrides = httpMocks.createRequest({
                headers: {
                    cookie: `toguru=bar=true|foo=true`,
                    toguru: 'bar=false|j=true',
                },
                query: {
                    toguru: 'foo=false|bar=true|k=false',
                },
            })

            const res = defaultForcedTogglesExtractor(requestWithCookieHeaderAndQueryParamOverrides)

            expect(res).toEqual({
                foo: false,
                bar: true,
                k: false,
                j: true,
            })
        })
    })
})
