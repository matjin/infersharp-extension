# infersharp-ext README

This is an extension which integrates [InferSharp](https://github.com/microsoft/infersharp) into VSCode. Currently, this extension has only been tested for Windows.

## Features

This extension adds the *InferSharp Analysis* command to the Command Palette. 

If InferSharp has not yet been set up on the machine yet, this command will perform installation by installing WSL Ubuntu if it is not already present and then downloading and unpacking InferSharp binaries to the WSL Linux file system. Please note that a Ubuntu terminal will open as a part of this setup process and invite you to set up a username and password; you may close this terminal without providing any input after it has prompted you to provide a UNIX username.

After setup, subsequent invocations of the command prompt the user to provide the root of a directory tree which contains the .dll and .pdb files produced by the project's build system. Note that these files need only need be somewhere in the tree, as InferSharp will traverse the tree to find the binaries. It conducts the analysis through WSL and copies the resulting infer-out directory to the provided path. The bug report is located at infer-out/report.txt.

## Requirements

Please see the requirements for [WSL](https://docs.microsoft.com/en-us/windows/wsl/install). In particular, please check that you are running Windows 10 version 2004 or higher (Build 19041 or higher), or Windows 11. Otherwise, automated setup may fail and you will have to set up WSL manually.

Additionally, please ensure that Ubuntu is your default distribution. 

## Known Issues

Automatic setup may fail, particularly if your version of Windows is too old. In this case, please try to run [manual](https://docs.microsoft.com/en-us/windows/wsl/install-manual) installation of WSL. Please set Ubuntu as the default distribution via the -s flag.

After setup, please execute the following commands from Powershell:

```
wsl -u root --cd '//wsl/Ubuntu/home/root/root' wget https://github.com/microsoft/infersharp/releases/download/v1.2/infersharp-linux64-v1.2.tar.gz -O infersharp.tar.gz
wsl -u root --cd '//wsl/Ubuntu/home/root/root' tar -xvzf infersharp.tar.gz
wsl -u root --cd '//wsl/Ubuntu/home/root/root' rm infersharp.tar.gz
```

The *InferSharp Analysis* command will now be ready for you to use.

## Release Notes

### 1.0.0

Initial release.