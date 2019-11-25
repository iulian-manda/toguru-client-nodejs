import Client, { ToguruClientConfig } from './client'
import { Response, Request, NextFunction } from 'express'
import { Toggle } from './models/Toggle'
import { UserInfo } from './models/toguru'
import { Toggles } from './models/Toggles'

type Extractor<T> = (r: Request) => T | undefined
type AttributeExtractor = { attribute: string; extractor: Extractor<string> }

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
class ToguruExpressMiddlewareConfigBuilder implements Partial<ToguruExpressMiddlewareConfig> {
    client?: ToguruClientConfig
    uuidExtractor?: Extractor<string>
    attributeExtractors?: AttributeExtractor[]
    forceTogglesExtractor?: Extractor<Record<string, boolean>>

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor() {}

    withAttributeExtractor(
        attributeExtractor: AttributeExtractor,
    ): this & Pick<ToguruExpressMiddlewareConfig, 'attributeExtractors'> {
        this.attributeExtractors = this.attributeExtractors ?? []
        this.attributeExtractors?.push(attributeExtractor)
        return { ...this, attributeExtractors: this.attributeExtractors }
    }

    withUUIDExtractor(ex: Extractor<string>): this & Pick<ToguruExpressMiddlewareConfig, 'uuidExtractor'> {
        this.uuidExtractor = ex
        return { ...this, uuidExtractor: this.uuidExtractor }
    }

    withClientConfig(client: ToguruClientConfig): this & Pick<ToguruExpressMiddlewareConfig, 'client'> {
        this.client = client
        return { ...this, client: this.client }
    }

    withForcedTogglesExtractor(
        ex: Extractor<Record<string, boolean>>,
    ): this & Pick<ToguruExpressMiddlewareConfig, 'forceTogglesExtractor'> {
        this.forceTogglesExtractor = ex
        return { ...this, forceTogglesExtractor: this.forceTogglesExtractor }
    }

    build(this: ToguruExpressMiddlewareConfig): ToguruExpressMiddlewareConfig {
        return this
    }
}

type ToguruExpressMiddlewareConfig = {
    client: ToguruClientConfig
    uuidExtractor: Extractor<string>
    forceTogglesExtractor: Extractor<Record<string, boolean>>
    attributeExtractors: AttributeExtractor[]
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

/**
 * @param endpoint - endpoint to the list of toggle states
 * @param refreshInterval - interval time to fetch and update toggle state list (in ms)
 * @param cookieName - name of the cookie containing the uuid for bucketing the user
 * @param cultureCookieName - name of the cookie containing the user culture value
 */

export default (config: ToguruExpressMiddlewareConfig) => {
    const client = Client(config.client)

    return async (req: Request, _: Response, next: NextFunction) => {
        try {
            const user: UserInfo = {
                uuid: config.uuidExtractor(req),
                forcedToggles: config.forceTogglesExtractor(req),
                attributes: config.attributeExtractors.reduce((acc, ax) => {
                    const value = ax.extractor(req)
                    if (value) acc[ax.attribute] = value
                    return acc
                }, {} as Record<string, string>),
            }

            req.toguru = {
                isToggleEnabled: (toggle: Toggle) => client.isToggleEnabled(toggle, user),
                togglesForService: (service: string) => client.togglesForService(service, user),
            }
        } catch (ex) {
            req.toguru = {
                isToggleEnabled: () => false,
                togglesForService: () => new Toggles([]),
            }
            console.warn('Error in Toguru Client:', ex)
        } finally {
            next()
        }
    }
}
