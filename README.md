# InferSharp Extension README

This is an extension which integrates [InferSharp](https://github.com/microsoft/infersharp) version 1.2 into VSCode. Currently, this extension has only been tested for Windows.

![Demo](https://github.com/matjin/infersharp-extension/blob/master/images/extension_text.gif?raw=true)

## Getting Started 

1. Run automatic setup via the *InferSharp Analysis* command added to your Command Palette by the extension. Install progress is reported in the InferSharp channel within the Output tab. See **Known Issues** if you run into any issues. Wait for setup to complete.
2. After setup is complete, running *InferSharp Analysis* will open File Explorer for you to select the root of the directory tree containing DLLs/PDBs to be analyzed.
3. Analysis will run, with progress updates being reported in the InferSharp window within the Output channel of VSCode. When it is completed, the analysis will open a SARIF representation of the warnings via the SARIF Viewer extension. Additionally, it will copy the full analysis output *infer-out/* directory to the directory you provided.

## Overview

This extension adds the *InferSharp Analysis* command to the Command Palette. 

If InferSharp has not yet been set up on the machine yet, this command will perform installation by installing WSL Ubuntu if it is not already present and then downloading and unpacking InferSharp binaries to the WSL Linux file system. Please note that a Ubuntu terminal will open as a part of this setup process and invite you to set up a username and password; you may close this terminal without providing any input after it has prompted you to provide a UNIX username.

After setup, subsequent invocations of the command prompt the user to provide the root of a directory tree which contains the .dll and .pdb files produced by the project's build system. Note that **these files need only need be somewhere in the tree**, as InferSharp will traverse the tree to find the binaries. It conducts the analysis through WSL and copies the resulting infer-out directory to the provided path. The bug report is located at infer-out/report.txt.

## Requirements

Please see the requirements for [WSL](https://docs.microsoft.com/en-us/windows/wsl/install). In particular, please check that you have virtualization turned on and are running Windows 10 version 2004 or higher (Build 19041 or higher), or Windows 11. Otherwise, automated setup may fail and you will have to set up WSL manually.

Additionally, please ensure that Ubuntu 20.04 is your default distribution. 

## Known Issues

*Automatic Setup Failure*

Automatic setup may fail, particularly if your version of Windows is too old or virtualization is not turned on. In this case, please try to run [manual](https://docs.microsoft.com/en-us/windows/wsl/install-manual) installation of WSL and set Ubuntu 20.04 as the default distribution via the -s flag.

After setup, please execute the following commands from Powershell (particularly note the rename of the binary folder to the correct version):

```
wsl ~ -u root wget https://github.com/microsoft/infersharp/releases/download/v1.2/infersharp-linux64-v1.2.tar.gz -O infersharp.tar.gz
wsl ~ -u root tar -xvzf infersharp.tar.gz
wsl ~ -u root mv infersharp infersharp1.2
wsl ~ -u root rm infersharp.tar.gz
```

The *InferSharp Analysis* command will now be ready for you to use.

*GLIBC error*

It's possible that you see the following issue upon attempting to run the analysis:

```
infersharp/infer/lib/infer/infer/bin/infer: /lib/x86_64-linux-gnu/libc.so.6: version `GLIBC_2.28' not found (required by infersharp/infer/lib/infer/infer/bin/infer)
infersharp/infer/lib/infer/infer/bin/infer: /lib/x86_64-linux-gnu/libc.so.6: version `GLIBC_2.28' not found (required by /root/infersharp/infer/lib/infer/infer/bin/../libso/libsqlite3.so.0)
```

This indicates the version of GLIBC on WSL is too old for the InferSharp binaries to execute; this can happen because you installed Ubuntu 18.04, for which the highest version of GLIBC is 2.27. To resolve this, please ensure that you've installed WSL Ubuntu 20.04.

## License
The extension is MIT-licensed.

## Release Notes

### 1.0.0

Initial release.