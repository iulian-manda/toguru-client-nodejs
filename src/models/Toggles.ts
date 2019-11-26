import { ToggleState } from './ToggleState'

export class Toggles {
    constructor(private state: ToggleState[]) {}

    /**
     * encodes toguru toggles as a queryString
     * uses `|` encoding instead of multi-param for compatibility with toguru-scala client
     */
    get queryString(): string {
        return `toguru=${encodeURIComponent(this.state.map(({ id, enabled }) => `${id}=${enabled}`).join('|'))}`
    }
}
