import { Toggles } from '../src/models/Toggles'

describe('Toggles class', () => {
    describe('queryString', () => {
        test('should return a correctly formatted query string', () => {
            const toggles = new Toggles([
                { id: 'toggle-1', enabled: true },
                { id: 'toggle-2', enabled: false },
            ])
            expect(toggles.queryString).toEqual(`toguru=${encodeURIComponent('toggle-1=true|toggle-2=false')}`)
        })
    })
})
