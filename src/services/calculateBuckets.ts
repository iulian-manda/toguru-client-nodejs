import BN from 'bn.js'

export default (uuid: string, defaultValue = 100): number => {
    // This calculation is broken.
    // Normally we would calculate with new BN(x).mod(new BN(100)).toNumber() + 1;
    // BUT: the existing scala client is doing strange calculation.
    // See thread here: https://github.com/AutoScout24/toguru-scala-client/pull/27

    const strippedUUID = uuid.replace(/-/g, '')
    const isUUIDInvalid = strippedUUID.length !== 32

    if (isUUIDInvalid) {
        return defaultValue
    }

    const hi = new BN(strippedUUID.substr(0, 16), 16)
    const lo = new BN(strippedUUID.substr(16, 16), 16)

    return lo
            .ishln(64)
            .iadd(hi)
            .fromTwos(128)
            .umod(new BN(100))
            .toNumber() + 1
}
