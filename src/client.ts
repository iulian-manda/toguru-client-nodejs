import fetchToguruData from './services/fetchToguruData'
import findToggleListForService from './services/toggleListForService'
import isToggleEnabledForUser from './services/isToggleEnabled'
import { UserInfo, ToguruData } from './models/toguru'
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

export type ToguruClient = {
    /**
     * Determine if the toggle is enabled based on user information
     */
    isToggleEnabled: (toggle: Toggle) => boolean

    /**
     * List of toggles that are enabled for a given service (special tag)
     */
    togglesForService: (service: string) => Toggles
}

export type ToguruClientFromUserInfo = (user: UserInfo) => ToguruClient

export default (config: ToguruClientConfig): ToguruClientFromUserInfo => {
    const { endpoint, refreshIntervalMs = refreshIntervalMsDefault } = config
    let toguruData: ToguruData = { sequenceNo: 0, toggles: [] }

    const refreshToguruData = () =>
        fetchToguruData(endpoint)
            .then((td) => (toguruData = td))
            .catch((e) => console.warn(`Unable to refresh toguru data: ${e}`))

    // Schedule refreshes
    refreshToguruData()
    setInterval(() => refreshToguruData(), refreshIntervalMs)

    return (user: UserInfo) => ({
        isToggleEnabled: (toggle) => isToggleEnabledForUser(toguruData, toggle, user),
        togglesForService: (service) => {
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
    })
}
