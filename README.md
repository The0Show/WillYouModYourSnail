![Will You Snail Modding Community Logo](src/Assets/Images/SnailSmall.png)
# Will You Mod Your Snail
A Will You Snail mod manager for **Windows**.

<!-- the wall of badges -->

![GitHub package.json version](https://img.shields.io/github/package-json/v/The0Show/WillYouModYourSnail)
[![Crowdin](https://badges.crowdin.net/will-you-mod-your-snail/localized.svg)](https://crowdin.com/project/will-you-mod-your-snail)
![GitHub](https://img.shields.io/github/license/The0Show/WillYouModYourSnail)

![Will You Mod Your Snail Update Server Status](https://img.shields.io/website?down_message=is%20down%20as%20expected&label=update%20server&up_message=is%20somehow%20running&url=https%3A%2F%2Fwillyoumodyoursnail.the0show.com%3A3000)
![Will You Mod Your Snail Browse API Status](https://img.shields.io/website?down_message=is%20down%20as%20expected&label=browse%20api&up_message=is%20somehow%20running&url=https%3A%2F%2Fwillyoumodyoursnail.the0show.com%3A3500)

## Important
Will You Mod Your Snail **is not complete**. There are parts of it that need to be finished, and to add on to that, the setup process is broken. But, it's general purpose of installing mods and starting the game is *useable*. If you truely want to run Will You Mod Your Snail *right now*, follow the instructions on compiling the app, and then follow the instructions on manually setting it up.

## Features
### Easily manage your mods for Will You Snail
![W4g1DO44Xg](https://user-images.githubusercontent.com/62229104/179859030-8b6ce27a-84aa-402b-a6cc-da24980cdac7.gif)

### Control GMML settings with ease
![6aFKc6l9hV](https://user-images.githubusercontent.com/62229104/179859468-ff923959-bf21-4c0e-bc3f-7450acf19f86.gif)

<!-- add more when its more complete lol -->

## Building
Building is simple, thanks to Electron Forge.

After cloning the repo, install dependencies...
```
npm i
```

...and run the following command.
```
npm run make
```

That's it! If you're a power user, here's some one liners that you can paste into your shell to clone, install, build, and open the output folder in one go.
```
Command Prompt: git clone https://git.the0show.com/WillYouModYourSnail.git && cd WillYouModYourSnail && npm i && npm run make && explorer out
Powershell: git clone https://git.the0show.com/WillYouModYourSnail.git; cd WillYouModYourSnail; npm i; npm run make; explorer out
WSL: git clone https://git.the0show.com/WillYouModYourSnail.git && cd WillYouModYourSnail && npm i && npm run make && explorer.exe out
```

## Manual Setup
If you really want to use it now, here's how to set it up.

First, and this is important, **install GMML into your Will You Snail game directory**! The setup process is completely broken, so it won't do it for you!

[Click here for a link to the latest version.](https://github.com/cgytrus/gmml/suites/6701126385/artifacts/254714050) Just open the zip and copy it's contents into your Will You Snail game directory (where `Will You Snail.exe` is inside of).

Now, launch the application. You should see this:
![image](https://user-images.githubusercontent.com/62229104/179861811-be5ba18a-13d3-43e9-9abd-dba62b86ba8f.png)

Unfortunately as previously stated, the setup process doesn't work. At all. So, we're going to have to go in manual mode.

Press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>I</kbd> or <kbd>F12</kbd> to open DevTools. Then, go to `Application` > `Local Storage` > `file://`. You should see this:
![image](https://user-images.githubusercontent.com/62229104/179862999-f289de97-9223-49f0-8a51-ed4eb9fd6b96.png)

As you can see, it's already filled out the default setting values for most of the config. All we need to do is specify the game directory.

Copy the path to your Will You Snail game directory (again, the one where `Will You Snail.exe` is inside of), and set it as the value of `gameDir`. It should look something like this:
![image](https://user-images.githubusercontent.com/62229104/179863228-9b1ea558-8afe-42d5-81de-83d2b18ff5f5.png)

Now, we're all setup! The last thing we have to do is exit this screen. There's two ways to do it:
### Restart the app (the "i'm too lazy to deal with the console today" method)
Press <kbd>Ctrl</kbd> + <kbd>R</kbd>. This will restart the app instantly.
> **Quick Tip**
> 
> This is one of the many shortcuts I've added into the app. Here's the rest of them:<br />
> - <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd> | Reloads the current page. Useful for testing changes to the page or it's preload scripts.
> - <kbd>F8</kbd> | Opens the issue reporter in your default browser.
> - <kbd>Shift</kbd> + <kbd>F8</kbd> | Opens your file browser, and highlights the current log file.

If all goes well, you should be brought to the `Mods` page.

### Switch to the page via console (the "i'm not lazy" method)
Switch to the `Console` tab in DevTools and run the following command:
```js
window.location.href = "mods.html"
```

No matter which method you use, you can test your game directory by going to the settings page. If it's invalid, it'll probably crash since it can't read your color schemes.

If you have any questions, you can ask me on DMs, issues, or discussions. Have fun!
