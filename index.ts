import _client, { TogglingApi } from './src/client'
import * as _expressBridge from './src/express/bridge'
import * as extractors from './src/express/extractors'
import { stubToguruMiddleware } from './src/express/testHelpers'

// Type exports
export { Toggle } from './src/models/Toggle'
export { ToggleState } from './src/models/ToggleState'
export { Toggles } from './src/models/Toggles'
export { ActivationContext } from './src/models/toguru'
export { ToguruClientConfig, TogglingApi, TogglingApiByActivationContext } from './src/client'
export { ExpressConfig } from './src/express/bridge'

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            toguru?: TogglingApi
        }
    }
}

export const toguruClient = _client

export const toguruTestHelpers = {
    express: {
        stubToguruMiddleware,
    },
}

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
