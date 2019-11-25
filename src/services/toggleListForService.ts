import { ToguruToggleData, ToguruData } from '../models/toguru'

const toggleBelongsToService = (toggle: ToguruToggleData, serviceName: string): boolean => {
    const service = (toggle?.tags['service'] || '').split(',')
    const services = (toggle?.tags['services'] || '').split(',')
    return service.concat(services).includes(serviceName)
}

export default (toguruData: ToguruData, service: string): string[] => {
    const toggles = toguruData.toggles || []
    const togglesForService = toggles.filter((t) => toggleBelongsToService(t, service))
    return togglesForService.map((t) => t.id)
}
