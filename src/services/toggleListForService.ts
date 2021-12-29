import { ToguruData } from '../models/toguru'

export default (toguruData: ToguruData, service: string): string[] => {
    return toguruData.toggleIdsByService.get(service) || []
}
