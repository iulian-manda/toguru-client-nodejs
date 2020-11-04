import * as index from '../index'

describe('The public API', () => {
    it('Exports useful types', () => {
        // Type-check test. Compiler will check the types are exported correctly
        const f = (
            _: index.ActivationContext,
            _2: index.Toggle,
            _3: index.ToggleState,
            _4: index.Toggles,
            _5: index.ToguruClientConfig,
            _6: index.TogglingApi,
            _7: index.TogglingApiByActivationContext,
        ) => ({})

        expect(typeof f === 'function').toBeTruthy()
    })

    it('Exports base client, express bridge and request extractors', () => {
        expect(typeof index.toguruClient === 'function').toBeTruthy()
        expect(typeof index.toguruExpressBridge.client === 'function').toBeTruthy()
        expect(typeof index.toguruExpressBridge.middleware === 'function').toBeTruthy()
        expect(Object.keys(index.toguruExpressBridge.requestExtractors)).toMatchInlineSnapshot(`
                        Array [
                          "cookieValue",
                          "forcedToggles",
                        ]
                `)
        expect(Object.keys(index.toguruExpressBridge.requestExtractors.forcedToggles)).toMatchInlineSnapshot(`
            Array [
              "fromCookie",
              "fromHeader",
              "fromQueryParam",
              "default",
            ]
        `)
    })
})
