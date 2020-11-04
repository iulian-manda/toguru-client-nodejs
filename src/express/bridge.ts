import { TogglingApi, TogglingApiByActivationContext } from '../client'
import { Response, Request, NextFunction } from 'express-serve-static-core'
import { Toggle } from '../models/Toggle'
import { ActivationContext } from '../models/toguru'
import { Extractor, ForcedToggleExtractor, cookieValue, defaultForcedTogglesExtractor } from './extractors'

export type ExpressConfig = {
    client: TogglingApiByActivationContext

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

/**
 * A refinement of the base toguru client that extracts activation information from the request
 */
export const expressClient = (config: ExpressConfig) => (req: Request): TogglingApi => {
    const extractors = { ...defaultExtractors, ...(config.extractors ? config.extractors : {}) }

    const context: ActivationContext = {
        uuid: extractors.uuid(req) || undefined,
        forcedToggles: extractors.forcedToggles(req),
        attributes: extractors.attributes.reduce<Record<string, string>>((acc, ax) => {
            const value = ax.extractor(req)
            return { ...acc, ...(value ? { [ax.attribute]: value } : {}) }
        }, {}),
    }

    return {
        isToggleEnabled: (toggle: Toggle) => config.client(context).isToggleEnabled(toggle),
        togglesForService: (service: string) => config.client(context).togglesForService(service),
    }
}

/**
 * An Express-middleware that provides toggle computation based on the Request information
 */
export const middleware = (config: ExpressConfig) => (req: Request, _: Response, next: NextFunction) => {
    req.toguru = expressClient(config)(req)

    next()
}
