export type Toggle = {
    /**
     * The unique identifier for the Toggle
     */
    id: string

    /**
     * Default value for the toggle in the abscence of additional information (i.e broken backend connection)
     */
    default: boolean
}
