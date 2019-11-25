import { Request } from 'express'
import cookie from 'cookie'

type Extractor = (request: Request) => string | undefined
type ExtractorOption = { caseInsensitive: boolean }

const valueCaseInsensitiveKey = (name: string, obj: Record<string, string>) => {
    const loweredCaseName = name.toLowerCase()
    const key = Object.keys(obj).find((c) => c.toLowerCase() == loweredCaseName)
    return key ? obj[key] : undefined
}

export const fromCookie = (name: string, option?: ExtractorOption) => (request: Request): string | undefined => {
    const cookieStr = request.headers?.cookie
    if (!cookieStr) return undefined
    const parsedCookies = cookie.parse(cookieStr)
    if (option) return valueCaseInsensitiveKey(name, parsedCookies)
    return parsedCookies[name]
}

export const fromHeader = (name: string, option?: ExtractorOption) => (request: Request): string | undefined => {
    const value = option?.caseInsensitive
        ? valueCaseInsensitiveKey(name, request.headers ? (request.headers as Record<string, string>) : {})
        : request.headers[name]
    if (value instanceof Array) return value[0]
    return value
}

export const togglesStringParser = (togglesString: string): Record<string, boolean> =>
    togglesString.split('|').reduce((toggles, toggleStr) => {
        if (toggleStr.length > 0) {
            const [key, value, ...others] = toggleStr.split('=')
            if (others.length < 1) toggles[key] = value == 'true'
        }
        return toggles
    }, {} as Record<string, boolean>)

const extractAndParse = (ex: Extractor) => (request: Request): Record<string, boolean> | undefined => {
    const extracted = ex(request)
    return extracted ? togglesStringParser(extracted) : undefined
}

export const defaultForcedTogglesExtractor = (request: Request): Record<string, boolean> => {
    const togglesFromHeader = () => {
        const xToguru = extractAndParse(fromHeader('x-toguru', { caseInsensitive: true }))(request)
        return xToguru ?? extractAndParse(fromHeader('toguru', { caseInsensitive: true }))(request)
    }

    const togglesFromCookie = () => extractAndParse(fromCookie('toguru', { caseInsensitive: true }))(request)

    const togglesFromQueryParam = () => {
        const toguruQuery = valueCaseInsensitiveKey('toguru', request.query ?? {})
        return toguruQuery ? togglesStringParser(toguruQuery) : undefined
    }

    return togglesFromHeader() ?? togglesFromCookie() ?? togglesFromQueryParam() ?? {}
}
