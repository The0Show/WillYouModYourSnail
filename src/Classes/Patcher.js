const DiffMatchPatch = require("diff-match-patch");

/**
 * Handles patching files.
 * This file is designed to be easiliy copiable into other projects, not designed just for this project.
 */
class Patcher {
    /**
     * Initalizes a {@link Patcher}.
     */
    constructor() {
        this.dmp = new DiffMatchPatch();
    }

    /**
     * Creates patch output that can be put into a file.
     * @param {Buffer} originalFile
     * @param {Buffer} modifiedFile
     * @returns {object}
     */
    createPatch(originalFile, modifiedFile) {
        const diff = this.dmp.diff_main(
            originalFile.toString("utf8"),
            modifiedFile.toString("utf8")
        );

        const patch = this.dmp.patch_make(diff);

        return this.dmp.patch_toText(patch);
    }

    /**
     * Patches a file.
     * @param {any} patchString The patch data.
     * @param {Buffer} inputFile The input file to be patched.
     * @returns {string} The patch result. This only handles doing the patching, not the saving of the patch.
     */
    patchFile(patchString, inputFile) {
        const patch = this.dmp.patch_fromText(patchString.toString());
        const [patchedText, result] = this.dmp.patch_apply(
            patch,
            inputFile.toString("utf8")
        );

        if (result[0]) {
            return patchedText;
        } else {
            return "Error";
        }
    }
}

module.exports = Patcher;
