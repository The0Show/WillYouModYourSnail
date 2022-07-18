module.exports = {
    packagerConfig: {},
    makers: [
        {
            name: "@electron-forge/maker-squirrel",
            config: {
                authors: ["The0Show", "Will You Snail Modding Community"],
                copyright:
                    "Copyright © 2022 The0Show and Will You Snail Modding Community",
                icon: "./src/Assets/Images/icon.ico",
                setupIcon: "./src/Assets/Images/icon.ico",
            },
        },
        {
            name: "@electron-forge/maker-zip",
            platforms: ["win32"],
        }
    ],
};
