import isEnabled from '../../src/services/isToggleEnabled'
import { ToguruData, ActivationContext } from '../../src/models/toguru'
import toggleState from '../mocks/togglestate.fixture.json'
import { Toggle } from '../../src/models/Toggle'

const users = {
    bucket76: {
        attributes: {},
        uuid: '721f87e2-cec9-4753-b3bb-d2ebe20dd317',
    },
    bucket22CultureDE: {
        attributes: { culture: 'de-DE' },
        uuid: '88248687-6dce-4759-a5c0-3945eedc2b48',
    },
    bucket76CultureDE: {
        attributes: { culture: 'de-DE' },
        uuid: '721f87e2-cec9-4753-b3bb-d2ebe20dd317',
    },
    bucket22CultureIT: {
        attributes: { culture: 'it-IT' },
        uuid: '88248687-6dce-4759-a5c0-3945eedc2b48',
    },
    bucket76CultureIT: {
        attributes: { culture: 'it-IT' },
        uuid: '721f87e2-cec9-4753-b3bb-d2ebe20dd317',
    },
    withoutUUIDWithAttributes: { attributes: { culture: 'de-DE' } },
    empty: {},
    attributeUserId123: { attributes: { user: 'user123' } },
}

const emptyToguruData: ToguruData = { sequenceNo: 0, toggles: [] }

const toggle = (id: string, defaultValue = false) => ({
    id,
    default: defaultValue,
})

const testToggleForUsers = (
    toggle: Toggle,
    cases: { user: ActivationContext; expectedIsEnabled: boolean }[],
    forcedToggles: Record<string, boolean> = {},
) => {
    test.each(cases)(`${toggle.id} for %o`,(c) => {
        expect(isEnabled(toggleState, toggle, { ...c.user, forcedToggles })).toBe(c.expectedIsEnabled)
    })
}

describe('isToggleEnabled', () => {
    it('when there is no toggles state should match the default condition', () => {
        expect(isEnabled(emptyToguruData, toggle('doesnt-matter', true), users.bucket22CultureDE)).toBe(true)
        expect(isEnabled(emptyToguruData, toggle('doesnt-matter', false), users.bucket22CultureDE)).toBe(false)
        expect(isEnabled(emptyToguruData, toggle('doesnt-matter', true), users.empty)).toBe(true)
        expect(isEnabled(emptyToguruData, toggle('doesnt-matter', false), users.empty)).toBe(false)
    })

    it('should return true if the rollout percentage is bigger or equal to the bucket the user is in', () => {
        expect(isEnabled(toggleState, toggle('rolled-out-to-76-percent', false), users.bucket76)).toBe(true)
        expect(isEnabled(toggleState, toggle('rolled-out-to-75-percent', true), users.bucket76)).toBe(false)
    })

    testToggleForUsers(
        toggle('rolled-out-to-none'),
        Object.values(users).map((u) => ({ user: u, expectedIsEnabled: false })),
    )

    testToggleForUsers(
        toggle('with-empty-activation'),
        Object.values(users).map((u) => ({ user: u, expectedIsEnabled: false })),
    )

    testToggleForUsers(
        toggle('unknown-toggle'),
        Object.values(users).map((u) => ({ user: u, expectedIsEnabled: false })),
    )

    testToggleForUsers(
        toggle('rolled-out-to-everyone'),
        Object.values(users).map((u) => ({ user: u, expectedIsEnabled: true })),
    )

    testToggleForUsers(toggle('rolled-out-to-half-of-users'), [
        { user: users.bucket22CultureDE, expectedIsEnabled: true },
        { user: users.bucket76CultureDE, expectedIsEnabled: false },
        { user: users.bucket22CultureIT, expectedIsEnabled: true },
        { user: users.bucket76CultureIT, expectedIsEnabled: false },
        { user: users.withoutUUIDWithAttributes, expectedIsEnabled: false },
        { user: users.empty, expectedIsEnabled: false },
    ])

    testToggleForUsers(
        toggle('rolled-out-only-in-de'),
        Object.values<ActivationContext>(users).map((u) => ({
            user: u,
            expectedIsEnabled:
                (u.attributes && u.attributes.culture && u.attributes.culture.includes('de-DE')) || false,
        })),
    )

    testToggleForUsers(
        toggle('rolled-out-only-in-it'),
        Object.values<ActivationContext>(users).map((u) => ({
            user: u,
            expectedIsEnabled:
                (u.attributes && u.attributes.culture && u.attributes.culture.includes('it-IT')) || false,
        })),
    )

    testToggleForUsers(toggle('rolled-out-to-half-in-de-only'), [
        { user: users.bucket22CultureDE, expectedIsEnabled: true },
        { user: users.bucket76CultureDE, expectedIsEnabled: false },
        { user: users.bucket22CultureIT, expectedIsEnabled: false },
        { user: users.bucket76CultureIT, expectedIsEnabled: false },
        { user: users.withoutUUIDWithAttributes, expectedIsEnabled: false },
        { user: users.empty, expectedIsEnabled: false },
    ])

    testToggleForUsers(toggle('rolled-out-to-user123-in-de'), [
        ...Object.values(users).map((u) => ({ user: u, expectedIsEnabled: false })),
        {
            user: {
                ...users.attributeUserId123,
                attributes: { ...users.attributeUserId123.attributes, culture: 'de-DE' },
            },
            expectedIsEnabled: true,
        },
    ])

    testToggleForUsers(
        toggle('rolled-out-to-none'),
        Object.values(users).map((u) => ({ user: u, expectedIsEnabled: true })),
        { 'rolled-out-to-none': true },
    )
})
