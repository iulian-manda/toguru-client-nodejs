export type ActivationContext = {
    /**
     * A unique identifier for the user. Used to determine bucketing
     */
    uuid?: string

    /**
     * Toggle overrides
     */
    forcedToggles?: Record<string, boolean>

    /**
     * Key-value pairs of attributes to compare against the toggle attributes when determining activation
     */
    attributes?: Record<string, string>
}

export type ToguruToggleData = {
    id: string
    tags: Record<string, string>
    activations: Array<{
        attributes?: Record<string, string[]>
        rollout?: {
            percentage: number
        }
    }>
}

export type RawToguruData = {
    sequenceNo: number
    toggles: ToguruToggleData[]
}

export type ToguruData = RawToguruData & {
    toggleIdsByService: Map<string, string[]>
}
