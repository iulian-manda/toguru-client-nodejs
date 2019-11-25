import fetchToguruData from './services/fetchToguruData'
import findToggleListForService from './services/toggleListForService'
import isToggleEnabledForUser from './services/isToggleEnabled'
import { UserInfo, ToguruData } from './types/toguru'
import { Toggle } from './types/Toggle'
import { Toggles } from './types/Toggles'
import { ToggleState } from './types/ToggleState'

export type ToguruClientConfig = {
    endpoint: string
    refreshIntervalMs?: number
}

export type ToguruClient = {
    isToggleEnabled: (toggle: Toggle, user: UserInfo) => boolean
    togglesForService: (service: string, user: UserInfo) => Toggles
}

export default (config: ToguruClientConfig): ToguruClient => {
    const { endpoint, refreshIntervalMs = 60000 } = config
    let toguruData: ToguruData = { sequenceNo: 0, toggles: [] }

    const refreshToguruData = () =>
        fetchToguruData(endpoint)
            .catch((e) => console.warn(`Unable to refresh toguru data: ${e}`))
            .then((td) => {
                if (td) {
                    toguruData = td
                }
            })

    refreshToguruData()

    setInterval(() => {
        refreshToguruData()
    }, refreshIntervalMs)

    return {
        isToggleEnabled: (toggle: Toggle, user: UserInfo): boolean => {
            return isToggleEnabledForUser(toguruData, toggle, user)
        },
        togglesForService: (service: string, user: UserInfo): Toggles => {
            const toggleIds = findToggleListForService(toguruData, service)
            const togglesState = toggleIds.reduce((toggles, id) => {
                toggles.push({ id, enabled: isToggleEnabledForUser(toguruData, { id, default: false }, user) })
                return toggles
            }, [] as ToggleState[])
            return new Toggles(togglesState)
        },
    }
}
