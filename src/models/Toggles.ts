import { ToggleState } from './ToggleState'

export function stringify<T>(
    values: T[],
    keyExtractor: (_: T) => string,
    valueExtractor: (_: T) => string,
    options: { delimiter: string },
): string {
    return values.reduce((acc: string, value: T, currentIndex: number, elems: T[]) => {
        const stringifiedValue = `${keyExtractor(value)}=${valueExtractor(value)}`
        if (currentIndex < elems.length - 1) {
            return acc + `${stringifiedValue}${options.delimiter}`
        }
        return acc + `${stringifiedValue}`
    }, '')
}

export class Toggles {
    togglesState: ToggleState[]

    constructor(togglesState: ToggleState[]) {
        this.togglesState = togglesState
    }

    queryString(): string {
        return `toguru=${encodeURIComponent(
            stringify(
                this.togglesState,
                (t) => t.id,
                (t) => t.enabled.toString(),
                { delimiter: '|' },
            ),
        )}`
    }
}
