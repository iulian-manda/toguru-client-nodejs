import calculateBucket from './calculateBuckets'
import { ToguruData, UserInfo } from '../types/toguru'
import { Toggle } from '../types/Toggle'

export default (toguruData: ToguruData, toggle: Toggle, { uuid, attributes, forcedToggles }: UserInfo): boolean => {
    if (forcedToggles && toggle.id in forcedToggles) {
        return forcedToggles[toggle.id]
    }

    const toggles = toguruData.toggles
    const toggleData = toggles.find((t) => t.id === toggle.id)
    const rolloutPercentage = toggleData?.activations[0]?.rollout?.percentage || 0

    // return default if the toggle is not set
    if (!toggleData) return toggle.default
    // if the uuid is not defined and the rollout is 100%, then the toggle activation depends only on the attributes
    const bucket = uuid ? calculateBucket(uuid, toggle.default ? 100 : 0) : 100
    const rolloutAttributes: Record<string, string[]> = toggleData?.activations[0]?.attributes || {}

    // Attributes are present in the toggle toguru data, but not present in the userinfo
    if (rolloutAttributes && Object.keys(rolloutAttributes).length > 0 && !attributes) return false

    for (const rolloutAttributeName in rolloutAttributes) {
        const attributeName = Object.keys(attributes || {}).find((a) => a === rolloutAttributeName)
        if (!attributeName) return false
        const attributeValue = attributes && attributes[attributeName]
        const rolloutAttributesValues = rolloutAttributes[rolloutAttributeName] || []
        if (!attributeValue || !rolloutAttributesValues.includes(attributeValue)) return false
    }

    if (rolloutPercentage >= bucket) {
        return true
    }

    return false
}
