const { bpsCreatePromise, bpsApplyPromise } = require("flips-wasm/lib/bps");

/**
 * Handles patching files.
 * This file is designed to be easiliy copiable into other projects, not designed just for this project.
 */
class Patcher {
    /**
     * Initalizes a {@link Patcher}.
     */
    constructor() {}

    /**
     * Creates patch output that can be put into a file.
     * @param {Buffer} originalFile
     * @param {Buffer} modifiedFile
     * @returns {Uint8Array}
     */
    async createPatch(originalFile, modifiedFile) {
        const diff = await bpsCreatePromise(originalFile, modifiedFile);

        return diff;
    }

    /**
     * Patches a file.
     * @param {any} patchString The patch data.
     * @param {Buffer} inputFile The input file to be patched.
     * @returns {Uint8Array} The patch result. This only handles doing the patching, not the saving of the patch.
     */
    async patchFile(patchString, inputFile) {
        const patch = await bpsApplyPromise(patchString, inputFile);

        return patch;
    }
}

module.exports = Patcher;
