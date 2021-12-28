import axios from 'axios'
import { RawToguruData, ToguruData } from '../models/toguru'

export const convertRawToguruDataToToguruData: (toguruData: RawToguruData) => ToguruData = (toguruData) => {
    const toggleIdsByService: ToguruData['toggleIdsByService'] = new Map()

    toguruData.toggles.forEach((toggle) => {
        ;(toggle.tags['services'] || '')
            .split(',')
            .concat(toggle.tags['service'])
            .forEach((service) => {
                service && toggleIdsByService.has(service)
                    ? toggleIdsByService.get(service)?.push(toggle.id)
                    : toggleIdsByService.set(service, [toggle.id])
            })
    })

    return {
        ...toguruData,
        toggleIdsByService,
    }
}

export default (endpoint: string): Promise<ToguruData> =>
    axios(endpoint, {
        headers: {
            Accept: 'application/vnd.toguru.v3+json',
        },
    }).then(({ data }: { data: RawToguruData }) => convertRawToguruDataToToguruData(data))
