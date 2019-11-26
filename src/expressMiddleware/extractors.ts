import { Request } from 'express'
import cookie from 'cookie'

export type Extractor<T> = (request: Request) => T | null
type ForcedToggleExtractor = (request: Request) => Record<string, boolean>

/**
 * Fetches object key value ignoring case-sensitivity
 */
const valueCaseInsensitiveKey = <T>(key: string, obj: Record<string, T>): T | null => {
    const keyLowerCased = key.toLowerCase()
    const keyMatch = Object.keys(obj || {}).find((c) => c.toLowerCase() == keyLowerCased)
    return keyMatch ? obj[keyMatch] : null
}

/**
 * Converts a string of the form <key1>=true|<key2>=false|... into a record
 */
const deserializeToguruValue = (s: string, separator: string = '|'): Record<string, boolean> =>
    s
        .split(separator)
        .filter((toggleKeyValue) => {
            const equals = toggleKeyValue.trim().indexOf('=')
            return equals !== -1 && equals !== 0 && equals !== toggleKeyValue.trim().length - 1
        })
        .reduce<Record<string, boolean>>((toggles, toggleKeyValue) => {
            const kv = toggleKeyValue.split('=')
            return { ...toggles, [kv[0]]: kv[1] === 'true' }
        }, {})

export const cookieValue = (name: string): Extractor<string> => (request) => {
    const rawCookie = request.headers?.cookie

    return rawCookie ? valueCaseInsensitiveKey(name, cookie.parse(rawCookie)) : null
}

export const fromCookie = (name: string): ForcedToggleExtractor => (request) => {
    const value = cookieValue(name)(request)

    return value ? deserializeToguruValue(value) : {}
}

export const fromHeader = (name: string): ForcedToggleExtractor => (request) => {
    const value = valueCaseInsensitiveKey(name, request.headers)

    return value instanceof Array
        ? value.map((v) => deserializeToguruValue(v)).reduce((acc, c) => ({ ...acc, ...c }))
        : value
        ? deserializeToguruValue(value)
        : {}
}

export const fromQueryParam = (name: string): ForcedToggleExtractor => (request) => {
    const value = valueCaseInsensitiveKey(name, (request.query as Record<string, string | string[]>) ?? {})

    return value instanceof Array
        ? value.map((v) => deserializeToguruValue(v)).reduce((acc, c) => ({ ...acc, ...c }))
        : value
        ? deserializeToguruValue(value)
        : {}
}

/**
 * Fetches forced toggles from a request based on defaults
 */
export const defaultForcedTogglesExtractor: ForcedToggleExtractor = (request: Request): Record<string, boolean> => ({
    ...fromCookie('toguru')(request),
    ...fromHeader('x-toguru')(request),
    ...fromHeader('toguru')(request),
    ...fromQueryParam('toguru')(request),
})
