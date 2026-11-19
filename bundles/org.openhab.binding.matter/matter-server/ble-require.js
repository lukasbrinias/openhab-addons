/**
 * Replaces "@matter/nodejs-ble/require" in the webpack bundle (see webpack.config.js).
 *
 * matter.js loads its Bluetooth libraries through a require() that is only resolved at runtime, so webpack would
 * leave them out of the bundle. Naming them here makes the require static. Only noble, the controller (central)
 * role, is included: the bridge does not advertise over Bluetooth, so bleno (the peripheral role) is not needed.
 */
exports.require = function bleRequire(id) {
    if (id === "@stoprocent/noble") {
        return require("@stoprocent/noble");
    }
    throw new Error(`${id} is not available in the openHAB Matter server`);
};
