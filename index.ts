import _client, { ToguruClient } from './src/client'
import * as _expressBridge from './src/express/bridge'
import * as extractors from './src/express/extractors'

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            toguru?: ToguruClient
        }
    }
}

export const toguruClient = _client

export const toguruExpressBridge = {
    middleware: _expressBridge.middleware,
    client: _expressBridge.expressClient,
    /**
     * Helper methods to extract information from the `Request`
     */
    requestExtractors: {
        cookieValue: extractors.cookieValue,
        forcedToggles: {
            fromCookie: extractors.fromCookie,
            fromHeader: extractors.fromHeader,
            fromQueryParam: extractors.fromQueryParam,
            default: extractors.defaultForcedTogglesExtractor,
        },
    },
}
