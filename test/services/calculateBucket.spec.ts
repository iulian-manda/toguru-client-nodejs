import calc from '../../src/services/calculateBuckets'

describe('Calculate bucket from uuid', () => {
    it('Bucket is calculated correctly for ea', () => {
        // Test cases below taken from toguru scala client
        // https://github.com/Autoscout24/toguru-scala-client
        expect(calc('92cccc65-3ee8-4fa8-a663-632dd282f42f')).toEqual(1)
        expect(calc('ef4ff1f7-d0d6-4129-b823-818e39b8dc24')).toEqual(6)
        expect(calc('5f908fdb-e569-4a2e-973f-73fe51b8a337')).toEqual(11)
        expect(calc('2cce917e-db13-4c16-8358-fb2c57069391')).toEqual(11)
        expect(calc('88248687-6dce-4759-a5c0-3945eedc2b48')).toEqual(22)
        expect(calc('0f27a764-029a-4716-8f1f-13b83fd53ff7')).toEqual(23)
        expect(calc('4bc77248-20fd-4946-bf09-183cabd34139')).toEqual(31)
        expect(calc('8f087b84-d989-4db9-8082-bd566ae9da56')).toEqual(38)
        expect(calc('363f325b-a1ea-488a-bfef-ad0f6578069c')).toEqual(39)
        expect(calc('d35bdaeb-ec34-474e-8536-c228120806d2')).toEqual(55)
        expect(calc('bd09284d-3489-4a2f-8fbf-1639aaf5b570')).toEqual(56)
        expect(calc('288e4fb2-97c0-4be7-b831-dd33156bb4ef')).toEqual(60)
        expect(calc('54c83aaf-7ca0-4e8a-8ca7-c0d97b23f0c8')).toEqual(71)
        expect(calc('721f87e2-cec9-4753-b3bb-d2ebe20dd317')).toEqual(76)
        expect(calc('f36d7579-77b2-47e9-859a-6e92156e430b')).toEqual(78)
        expect(calc('f35cb052-0e75-4393-ba2f-84aaab15f087')).toEqual(80)
        expect(calc('6eb1698e-1a9e-4fc9-be24-36f68021b335')).toEqual(82)
        expect(calc('86bf949b-a75b-44b2-8e66-2f766fa43f48')).toEqual(91)
        expect(calc('476893d9-65cd-410d-a294-ac086c5fffa3')).toEqual(94)
        expect(calc('88d8bbd2-809f-4edf-a38e-7a98dddc06a3')).toEqual(96)
        expect(calc('777baa8c-e289-4b46-8de7-3d904e041950')).toEqual(99)
        expect(calc('b2d886c9-a7d8-469f-83e7-483a1ce97ac7')).toEqual(100)
        expect(calc('c14280be-1659-464b-bbf7-4968a7513c76')).toEqual(100)
    })
})
