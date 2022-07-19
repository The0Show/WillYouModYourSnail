const { readFileSync } = require("fs-extra");
const { Logger } = require("winston");

/**
 * A class for reading and parsing WYSMOD files.
 */
class WYSMOD {
    /**
     * Initializes the WYSMOD class.
     */
    constructor() {
        this.rawFileData;
        this.parsedFileData = null;

        this.offset = 0;
    }

    /**
     * Reads the specified segment of the {@link Buffer} as a UTF-8 string.
     * @param {number} start The byte offset to start reading at.
     * @param {number} length How many bytes to read for.
     * @returns {string} The {@link Buffer} segment as a UTF-8 string.
     */
    readStringSegment(start, length) {
        return this.rawFileData.toString("utf8", start, start + length);
    }

    readInt8(offset) {
        this.offset += 1;
        return this.rawFileData.readInt8(offset);
    }

    readInt16(offset) {
        this.offset += 2;
        return this.rawFileData.readInt16LE(offset);
    }

    readInt32(offset) {
        this.offset += 4;
        return this.rawFileData.readInt32LE(offset);
    }

    readInt64(offset) {
        this.offset += 8;
        return parseInt(this.rawFileData.readBigInt64LE(offset).toString());
    }

    readDouble(offset) {
        this.offset += 8;
        return this.rawFileData.readDoubleLE(offset);
    }

    /**
     * Reads the WYSMOD file and stores the resulting {@link Buffer}.
     *
     * ***Please note that this does not parse the file.*** You'll need to trigger a parse by calling the {@link parseFileData} function.
     * @param {string} path The path to the WYSMOD file, usually provided by the Upload page.
     */
    readWYSMODFile(path) {
        this.rawFileData = readFileSync(path);
    }

    async parseFileData() {
        this.offset = 7;

        if (!this.rawFileData)
            throw new Error(
                "No file data found. Have you ran readWYSMODFile()?"
            );

        if (this.parsedFileData !== null)
            console.warn(
                "Parsed file data already exists, and is being erased."
            );

        this.parsedFileData = { metadata: {}, file: Buffer.from([0x00]) };

        if (this.readStringSegment(0, 7) !== "WYSMOD1")
            throw new Error("File is not WYSMOD, cannot parse");

        let length = this.readInt16(this.offset);

        // Read mod ID
        this.parsedFileData.metadata["id"] = this.readStringSegment(
            this.offset,
            length
        );

        this.offset += length;

        // Read mod name
        length = this.readInt32(this.offset);
        this.parsedFileData.metadata["name"] = this.readStringSegment(
            this.offset,
            length
        );

        this.offset += length;

        // Read mod version
        length = this.readInt8(this.offset);
        this.parsedFileData.metadata["version"] = this.readStringSegment(
            this.offset,
            length
        );

        this.offset += length;

        // Read mod author(s)
        length = this.readInt32(this.offset);
        this.parsedFileData.metadata["authors"] = this.readStringSegment(
            this.offset,
            length
        ).split(",");

        this.offset += length;

        // Read mod description
        length = this.readInt64(this.offset);
        this.parsedFileData.metadata["description"] = this.readStringSegment(
            this.offset,
            length
        );

        this.offset += length;

        // Read mod dependencies
        length = this.readInt32(this.offset);
        this.parsedFileData.metadata["dependencies"] = [];

        if (length > 0) {
            this.readStringSegment(this.offset, length)
                .split(",")
                .forEach((dependency) => {
                    this.parsedFileData.metadata["dependencies"].push({
                        id: dependency.split("@")[0],
                        version: dependency.split("@")[1],
                    });
                });
        }

        this.offset += length;

        // Read file data
        this.parsedFileData.file = this.rawFileData.slice(this.offset);
    }
}

module.exports = WYSMOD;
