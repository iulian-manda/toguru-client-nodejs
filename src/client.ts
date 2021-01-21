import fetchToguruData from './services/fetchToguruData'
import findToggleListForService from './services/toggleListForService'
import isToggleEnabledForUser from './services/isToggleEnabled'
import { ActivationContext, ToguruData } from './models/toguru'
import { Toggle } from './models/Toggle'
import { Toggles } from './models/Toggles'
import { ToggleState } from './models/ToggleState'

const refreshIntervalMsDefault = 60000

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

export type TogglingApi = {
    /**
     * Determine if the toggle is enabled
     */
    isToggleEnabled: (toggle: Toggle) => boolean

    /**
     * List of toggles that are enabled for a given service (special tag)
     */
    togglesForService: (service: string) => Toggles
}

export type TogglingApiByActivationContext = (context: ActivationContext) => TogglingApi

export type ToguruClientGeneratorConfig = {
    config: ToguruClientConfig
    fetcher: (endpoint: string) => Promise<ToguruData>
}
export type ToguruClientGenerator = (generatorConfig: ToguruClientGeneratorConfig) => TogglingApiByActivationContext
export const toguruClientGenerator: ToguruClientGenerator = ({ config, fetcher }) => {
    const { endpoint, refreshIntervalMs = refreshIntervalMsDefault } = config
    let toguruData: ToguruData = { sequenceNo: 0, toggles: [] }

    const refreshToguruData = () =>
        fetcher(endpoint)
            .then((td) => {
                toguruData = td
                console.info(`Refreshed toguru data, seqNo: ${toguruData.sequenceNo}`)
            })
            .catch((e) => console.warn(`Unable to refresh toguru data: ${e}`))

    // Schedule refreshes
    refreshToguruData()
    setInterval(() => refreshToguruData(), refreshIntervalMs)

    return (context) => ({
        isToggleEnabled: (toggle) => isToggleEnabledForUser(toguruData, toggle, context),
        togglesForService: (service) => {
            const toggleIds = findToggleListForService(toguruData, service)
            const togglesState = toggleIds.reduce<ToggleState[]>(
                (toggles, id) => [
                    ...toggles,
                    { id, enabled: isToggleEnabledForUser(toguruData, { id, default: false }, context) },
                ],
                [],
            )

            return new Toggles(togglesState)
        },
    })
}

export const defaultClient = (config: ToguruClientConfig): TogglingApiByActivationContext =>
    toguruClientGenerator({ config, fetcher: fetchToguruData })
