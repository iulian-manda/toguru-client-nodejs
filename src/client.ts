import fetchToguruData from './services/fetchToguruData'
import findToggleListForService from './services/toggleListForService'
import isToggleEnabledForUser from './services/isToggleEnabled'
import { UserInfo, ToguruData } from './models/toguru'
import { Toggle } from './models/Toggle'
import { Toggles } from './models/Toggles'
import { ToggleState } from './models/ToggleState'

export type ToguruClientConfig = {
    /**
     * The toguru backend endpoint
     */
    endpoint: string
    /**
     * How often to pull toguru information from the backend
     */
    refreshIntervalMs?: number
}

export type ToguruClient = {
    /**
     * Determine if the toggle is enabled based on user information
     */
    isToggleEnabled: (user: UserInfo) => (toggle: Toggle) => boolean

    /**
     * List of toggles that are enabled for a given service (special tag)
     */
    togglesForService: (user: UserInfo) => (service: string) => Toggles
}

export default (config: ToguruClientConfig): ToguruClient => {
    const { endpoint, refreshIntervalMs = 60000 } = config
    let toguruData: ToguruData = { sequenceNo: 0, toggles: [] }

    const refreshToguruData = () =>
        fetchToguruData(endpoint)
            .then((td) => (toguruData = td))
            .catch((e) => console.warn(`Unable to refresh toguru data: ${e}`))

    refreshToguruData()

    setInterval(() => refreshToguruData(), refreshIntervalMs)

    return {
        isToggleEnabled: (user: UserInfo) => (toggle: Toggle): boolean =>
            isToggleEnabledForUser(toguruData, toggle, user),

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
