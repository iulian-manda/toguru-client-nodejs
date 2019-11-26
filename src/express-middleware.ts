import { ToguruClient } from './client'
import { Response, Request, NextFunction } from 'express'
import { Toggle } from './models/Toggle'
import { UserInfo } from './models/toguru'
import { Toggles } from './models/Toggles'
import {
    Extractor,
    ForcedToggleExtractor,
    cookieValue,
    defaultForcedTogglesExtractor,
} from './expressMiddleware/extractors'

type ExpressConfig = {
    client: ToguruClient

    /**
     * Customize request extractors
     */
    extractors?: {
        /**
         * Visitor UUID extractor
         */
        uuid?: Extractor<string>
        /**
         * Forced-toggles extractor
         */
        forcedToggles?: ForcedToggleExtractor

        /**
         * Extractors for different toggle attributes
         * The value extracted from the request will be used to compared against the toggle attribute to determine activation
         */
        attributes?: Array<{
            attribute: string
            extractor: Extractor<string>
        }>
    }
}

const defaultExtractors: NonNullable<Required<ExpressConfig['extractors']>> = {
    uuid: cookieValue('uid'),
    forcedToggles: defaultForcedTogglesExtractor,
    attributes: [
        {
            attribute: 'culture',
            extractor: cookieValue('culture'),
        },
    ],
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            toguru?: {
                isToggleEnabled: (toggle: Toggle) => boolean
                togglesForService: (service: string) => Toggles
            }
        }
    }
}

export const middleware = (config: ExpressConfig) => (req: Request, _: Response, next: NextFunction) => {
    req.toguru = client(config)(req)

    next()
}

/**
 * A refinement of the base toguru client that extracts user information from the request
 */
export const client = (config: ExpressConfig) => (req: Request) => {
    const extractors = { ...defaultExtractors, ...(config.extractors ? config.extractors : {}) }

    const user: UserInfo = {
        uuid: extractors.uuid(req) || undefined,
        forcedToggles: extractors.forcedToggles(req),
        attributes: extractors.attributes.reduce<Record<string, string>>((acc, ax) => {
            const value = ax.extractor(req)
            return { ...acc, ...(value ? { [ax.attribute]: value } : {}) }
        }, {}),
    }

    return {
        isToggleEnabled: (toggle: Toggle) => config.client.isToggleEnabled(user)(toggle),
        togglesForService: (service: string) => config.client.togglesForService(user)(service),
    }
}
