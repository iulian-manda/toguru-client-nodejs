import { convertRawToguruDataToToguruData } from '../../src/services/fetchToguruData'
import findToggleListForService from '../../src/services/toggleListForService'

const toggleWithTags = (id: string, tags: Record<string, string>) => {
    return { id, tags: { ...tags }, activations: [] }
}
const togglesState = convertRawToguruDataToToguruData({
    sequenceNo: 96,
    toggles: [
        toggleWithTags('toggle-service1-service', { service: 'service1' }),
        toggleWithTags('toggle-service1-services', { services: 'service1,another,anotherone' }),
        toggleWithTags('toggle-no-service1', { services: 'atoggle,another,anotherone' }),
    ],
})

describe('Find Toggle Names for Service', () => {
    it('works both for both the service and services tag', () => {
        expect(findToggleListForService(togglesState, 'service1')).toEqual([
            'toggle-service1-service',
            'toggle-service1-services',
        ])
        expect(findToggleListForService(togglesState, 'service2')).toEqual([])
    })
})
