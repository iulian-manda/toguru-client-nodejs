import isEnabled from '../src/services/isToggleEnabled'
import { ToguruData, UserInfo } from '../src/models/toguru'
import toggleState from './togglestate.fixture.json'

const userInBucket22CultureDE = {
    attributes: { culture: 'de-DE' },
    uuid: '88248687-6dce-4759-a5c0-3945eedc2b48',
} // bucket: 22
const userInBucket76CultureDE = {
    attributes: { culture: 'de-DE' },
    uuid: '721f87e2-cec9-4753-b3bb-d2ebe20dd317',
} // bucket: 76
const userInBucket22CultureIT = {
    attributes: { culture: 'it-IT' },
    uuid: '88248687-6dce-4759-a5c0-3945eedc2b48',
} // bucket: 22
const userInBucket76CultureIT: UserInfo = {
    attributes: { culture: 'it-IT' },
    uuid: '721f87e2-cec9-4753-b3bb-d2ebe20dd317',
} // bucket: 76
const userWithoutUUID = { attributes: { culture: 'de-DE' } } // bucket: 1
const userEmpty = {}

const emptyToguruData: ToguruData = { sequenceNo: 0, toggles: [] }

const toggle = (id: string, defaultValue = false) => ({ id, default: defaultValue })

describe('Is Toggle Enabled', () => {
    it('empty toggles state', () => {
        expect(isEnabled(emptyToguruData, toggle('doesnt-matter', true), userInBucket22CultureDE)).toBe(true)
        expect(isEnabled(emptyToguruData, toggle('doesnt-matter', false), userInBucket22CultureDE)).toBe(false)
        expect(isEnabled(emptyToguruData, toggle('doesnt-matter', true), userEmpty)).toBe(true)
        expect(isEnabled(emptyToguruData, toggle('doesnt-matter', false), userEmpty)).toBe(false)
    })

    it('rolled-out-to-noone', () => {
        expect(isEnabled(toggleState, toggle('rolled-out-to-noone'), userInBucket22CultureDE)).toBe(false)
        expect(isEnabled(toggleState, toggle('rolled-out-to-noone'), userInBucket76CultureDE)).toBe(false)
        expect(isEnabled(toggleState, toggle('rolled-out-to-noone'), userInBucket22CultureIT)).toBe(false)
        expect(isEnabled(toggleState, toggle('rolled-out-to-noone'), userInBucket76CultureIT)).toBe(false)
        expect(isEnabled(toggleState, toggle('rolled-out-to-noone'), userWithoutUUID)).toBe(false)
        expect(isEnabled(toggleState, toggle('rolled-out-to-noone'), userEmpty)).toBe(false)
    })

    it('with-empty-activation', () => {
        expect(isEnabled(toggleState, toggle('with-empty-activation'), userInBucket22CultureDE)).toBe(false)
        expect(isEnabled(toggleState, toggle('with-empty-activation'), userInBucket76CultureDE)).toBe(false)
        expect(isEnabled(toggleState, toggle('with-empty-activation'), userInBucket22CultureIT)).toBe(false)
        expect(isEnabled(toggleState, toggle('with-empty-activation'), userInBucket76CultureIT)).toBe(false)
        expect(isEnabled(toggleState, toggle('with-empty-activation'), userWithoutUUID)).toBe(false)
        expect(isEnabled(toggleState, toggle('with-empty-activation'), userEmpty)).toBe(false)
    })

    it('unknown toggle', () => {
        expect(isEnabled(toggleState, toggle('unknown-toggle'), userInBucket22CultureDE)).toBe(false)
        expect(isEnabled(toggleState, toggle('unknown-toggle'), userEmpty)).toBe(false)
    })

    it('rolled-out-to-everyone', () => {
        expect(isEnabled(toggleState, toggle('rolled-out-to-everyone'), userInBucket22CultureDE)).toBe(true)
        expect(isEnabled(toggleState, toggle('rolled-out-to-everyone'), userInBucket76CultureDE)).toBe(true)
        expect(isEnabled(toggleState, toggle('rolled-out-to-everyone'), userInBucket22CultureIT)).toBe(true)
        expect(isEnabled(toggleState, toggle('rolled-out-to-everyone'), userInBucket76CultureIT)).toBe(true)
        expect(isEnabled(toggleState, toggle('rolled-out-to-everyone'), userWithoutUUID)).toBe(true)
        expect(isEnabled(toggleState, toggle('rolled-out-to-everyone'), userEmpty)).toBe(true)
    })

    it('rolled-out-to-half-of-users', () => {
        expect(isEnabled(toggleState, toggle('rolled-out-to-half-of-users'), userInBucket22CultureDE)).toBe(true)
        expect(isEnabled(toggleState, toggle('rolled-out-to-half-of-users'), userInBucket76CultureDE)).toBe(false)
        expect(isEnabled(toggleState, toggle('rolled-out-to-half-of-users'), userInBucket22CultureIT)).toBe(true)
        expect(isEnabled(toggleState, toggle('rolled-out-to-half-of-users'), userInBucket76CultureIT)).toBe(false)
        expect(isEnabled(toggleState, toggle('rolled-out-to-half-of-users'), userWithoutUUID)).toBe(false)
        expect(isEnabled(toggleState, toggle('rolled-out-to-half-of-users'), userEmpty)).toBe(false)
    })

    it('rolled-out-only-in-de', () => {
        expect(isEnabled(toggleState, toggle('rolled-out-only-in-de'), userInBucket22CultureDE)).toBe(true)
        expect(isEnabled(toggleState, toggle('rolled-out-only-in-de'), userInBucket76CultureDE)).toBe(true)
        expect(isEnabled(toggleState, toggle('rolled-out-only-in-de'), userInBucket22CultureIT)).toBe(false)
        expect(isEnabled(toggleState, toggle('rolled-out-only-in-de'), userInBucket76CultureIT)).toBe(false)
        expect(isEnabled(toggleState, toggle('rolled-out-only-in-de'), userWithoutUUID)).toBe(true)
        expect(isEnabled(toggleState, toggle('rolled-out-only-in-de'), userEmpty)).toBe(false)
    })

    it('rolled-out-to-none-not-even-in-de', () => {
        expect(isEnabled(toggleState, toggle('rolled-out-to-none-not-even-in-de'), userInBucket22CultureDE)).toBe(false)
        expect(isEnabled(toggleState, toggle('rolled-out-to-none-not-even-in-de'), userInBucket76CultureDE)).toBe(false)
        expect(isEnabled(toggleState, toggle('rolled-out-to-none-not-even-in-de'), userInBucket22CultureIT)).toBe(false)
        expect(isEnabled(toggleState, toggle('rolled-out-to-none-not-even-in-de'), userInBucket76CultureIT)).toBe(false)
        expect(isEnabled(toggleState, toggle('rolled-out-to-none-not-even-in-de'), userWithoutUUID)).toBe(false)
        expect(isEnabled(toggleState, toggle('rolled-out-to-none-not-even-in-de'), userEmpty)).toBe(false)
    })

    it('rolled-out-to-half-in-de-only', () => {
        expect(isEnabled(toggleState, toggle('rolled-out-to-half-in-de-only'), userInBucket22CultureDE)).toBe(true)
        expect(isEnabled(toggleState, toggle('rolled-out-to-half-in-de-only'), userInBucket76CultureDE)).toBe(false)
        expect(isEnabled(toggleState, toggle('rolled-out-to-half-in-de-only'), userInBucket22CultureIT)).toBe(false)
        expect(isEnabled(toggleState, toggle('rolled-out-to-half-in-de-only'), userInBucket76CultureIT)).toBe(false)
        expect(isEnabled(toggleState, toggle('rolled-out-to-half-in-de-only'), userWithoutUUID)).toBe(false)
        expect(isEnabled(toggleState, toggle('rolled-out-to-half-in-de-only'), userEmpty)).toBe(false)
    })

    it('forced toggles', () => {
        const forcedToggles = { 'rolled-out-to-noone': true }

        expect(
            isEnabled(toggleState, toggle('rolled-out-to-noone'), {
                ...userInBucket22CultureDE,
                forcedToggles,
            }),
        ).toBe(true)
        expect(
            isEnabled(toggleState, toggle('rolled-out-to-noone'), {
                ...userInBucket76CultureDE,
                forcedToggles,
            }),
        ).toBe(true)
        expect(
            isEnabled(toggleState, toggle('rolled-out-to-noone'), {
                ...userInBucket22CultureIT,
                forcedToggles,
            }),
        ).toBe(true)
        expect(
            isEnabled(toggleState, toggle('rolled-out-to-noone'), {
                ...userInBucket76CultureIT,
                forcedToggles,
            }),
        ).toBe(true)
        expect(
            isEnabled(toggleState, toggle('rolled-out-to-noone'), {
                ...userWithoutUUID,
                forcedToggles,
            }),
        ).toBe(true)
        expect(isEnabled(toggleState, toggle('rolled-out-to-noone'), { forcedToggles })).toBe(true)
    })
})
