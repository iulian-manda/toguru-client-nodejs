import fetchToguruData from './services/fetchToguruData'
import findToggleListForService from './services/toggleListForService'
import isToggleEnabledForUser from './services/isToggleEnabled'
import { UserInfo, ToguruData } from './models/toguru'
import { Toggle } from './models/Toggle'
import { Toggles } from './models/Toggles'
import { ToggleState } from './models/ToggleState'
import { Request } from 'express'

const refreshIntervalMsDefault = 60000

const defaultExtractor: (request: Request) => UserInfo = () => ({}) // TODO: Add extractor here that is a default extractor (or maybe define it in the extractors.ts)

export type ToguruClientConfig = {
    /**
     * The toguru backend endpoint
     */
    endpoint: string
    /**
     * How often to pull toguru information from the backend. Defaults to 60 secs
     */
    refreshIntervalMs?: number
}
// (req: Request) => UserInfo = defaultExtractor
export type ToguruClient = {
    /**
     * Determine if the toggle is enabled based on user information
     */
    isToggleEnabled(user: UserInfo): (toggle: Toggle) => boolean
    /**
     * Determine if the toggle is enabled for a given request and optional extractor.
     * If extractor is not provided, it will default to standard one
     */
    isToggleEnabled(request: Request, extractor: (request: Request) => UserInfo): (toggle: Toggle) => boolean

    /**
     * List of toggles that are enabled for a given service (special tag)
     */
    togglesForService: (user: UserInfo) => (service: string) => Toggles
}

const isRequest = (userOrRequest: UserInfo | Request): userOrRequest is Request =>
    (userOrRequest as Request).addListener !== undefined

export default (config: ToguruClientConfig): ToguruClient => {
    const { endpoint, refreshIntervalMs = refreshIntervalMsDefault } = config
    let toguruData: ToguruData = { sequenceNo: 0, toggles: [] }

    const refreshToguruData = () =>
        fetchToguruData(endpoint)
            .then((td) => (toguruData = td))
            .catch((e) => console.warn(`Unable to refresh toguru data: ${e}`))

    // Schedule refreshes
    refreshToguruData()
    setInterval(() => refreshToguruData(), refreshIntervalMs)

    return {
        isToggleEnabled: (
            userOrRequest: UserInfo | Request,
            extractor: (request: Request) => UserInfo = defaultExtractor,
        ) => (toggle: Toggle): boolean => {
            return isRequest(userOrRequest)
                ? isToggleEnabledForUser(toguruData, toggle, extractor!(userOrRequest))
                : isToggleEnabledForUser(toguruData, toggle, userOrRequest)
        },
        togglesForService: (user: UserInfo) => (service: string): Toggles => {
            const toggleIds = findToggleListForService(toguruData, service)
            const togglesState = toggleIds.reduce<ToggleState[]>(
                (toggles, id) => [
                    ...toggles,
                    { id, enabled: isToggleEnabledForUser(toguruData, { id, default: false }, user) },
                ],
                [],
            )

            return new Toggles(togglesState)
        },
    }
}
