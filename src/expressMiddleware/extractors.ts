import { Request } from 'express'
import cookie from 'cookie'

type Extractor = (request: Request) => string | null

const valueCaseInsensitiveKey = <T>(key: string, obj: Record<string, T>): T | null => {
    const keyLowerCased = key.toLowerCase()
    const keyMatch = Object.keys(obj || {}).find((c) => c.toLowerCase() == keyLowerCased)
    return keyMatch ? obj[keyMatch] : null
}

export const fromCookie = (name: string): Extractor => (request: Request) => {
    const rawCookie = request.headers?.cookie

    return rawCookie ? valueCaseInsensitiveKey(name, cookie.parse(rawCookie)) : null
}

export const fromHeader = (name: string): Extractor => (request: Request) => {
    const value = valueCaseInsensitiveKey(name, request.headers)

    return value instanceof Array ? value[0] : value ?? null
}

export const fromQueryParam = (name: string): Extractor => (request: Request) => {
    const value = valueCaseInsensitiveKey(name, (request.query as Record<string, string | string[]>) ?? {})
    return value instanceof Array ? value[0] : value
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
        const xToguru = extractAndParse(fromHeader('x-toguru'))(request)
        return xToguru ?? extractAndParse(fromHeader('toguru'))(request)
    }

    const togglesFromCookie = () => extractAndParse(fromCookie('toguru'))(request)

    return togglesFromHeader() ?? togglesFromCookie() ?? extractAndParse(fromQueryParam('toguru'))(request) ?? {}
}
