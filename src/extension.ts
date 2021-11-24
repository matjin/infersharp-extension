// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as cp from 'child_process';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let infersharpConsole = vscode.window.createOutputChannel("InferSharp");
	infersharpConsole.show();
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('infersharp-ext.analyze', () => {
		const options: vscode.OpenDialogOptions = {
			canSelectMany: false,
			openLabel: 'Open',
			canSelectFiles: false,
			canSelectFolders: true,
			defaultUri: vscode.workspace.workspaceFolders === undefined ? undefined : vscode.workspace.workspaceFolders[0].uri
	   };
		// The code you place here will be executed every time your command is executed
		let res = cp.spawnSync("wsl ~ -u root ls infersharp", { shell: 'powershell.exe' });
		if (res.status !== 0) {
			// TODO: add timeout on the command
			// investigate different wsl root path
			infersharpConsole.appendLine("Starting install; please wait while Infer# binaries are downloaded and extracted.");
			let analysisCommands = [
				"wsl --install -d ubuntu",
				"do {wsl ~ -d ubuntu -u root wget https://github.com/microsoft/infersharp/releases/download/v1.2/infersharp-linux64-v1.2.tar.gz -O infersharp.tar.gz; $success =$?; Start-Sleep -s 5;} until ($success);",
				"wsl ~ -d ubuntu -u root tar -xvzf infersharp.tar.gz",
				"wsl ~ -d ubuntu -u root rm infersharp.tar.gz",
				"wsl -s ubuntu",
				"echo 'Setup complete. You may now run Infer#!'"
			];
			let setup = cp.spawn(analysisCommands.join(' ; '), { shell: 'powershell.exe' });
			setup.stdout.on('data', data => infersharpConsole.append(data.toString()));
			setup.stderr.on('data', data => infersharpConsole.append(data.toString()));
		}
		else {
			infersharpConsole.clear();
			vscode.window.showOpenDialog(options).then(async fileUri => {
				if (fileUri && fileUri[0]) {
					let drivePrefix = fileUri[0].path.split('/')[1];
					let newDrivePrefix = drivePrefix.replace(':', '').toLowerCase();
					let inputPath = "//mnt/" + newDrivePrefix + '/' + fileUri[0].path.substring(drivePrefix.length + 2);
					infersharpConsole.appendLine('InferSharp is analyzing: ' + inputPath);
					let analysisCommands = [
						"wsl ~ -u root rm -rf infer-out/",
						"wsl ~ -u root cp infersharp/Cilsil/System.Private.CoreLib.dll " + inputPath + "/System.Private.CoreLib.dll",
						"wsl echo 'Beginning translation.'",
						"wsl ~ -u root infersharp/Cilsil/Cilsil translate " + inputPath + " --outcfg " + inputPath + "/cfg.json " + " --outtenv " + inputPath + "/tenv.json",
						"wsl ~ -u root mv " + inputPath + "/cfg.json" + " ~/cfg.json",
						"wsl ~ -u root mv " + inputPath + "/tenv.json" + " ~/tenv.json",
						"wsl ~ -u root rm -rf " + inputPath + "/System.Private.CoreLib.dll",
						"wsl ~ -u root rm -rf " + inputPath + "/infer-out",
						"wsl echo 'Translation complete. Beginning analysis.'",
						"wsl ~ -u root infersharp/infer/lib/infer/infer/bin/infer capture",
						"wsl ~ -u root mkdir -p infer-out/captured",
						"wsl ~ -u root infersharp/infer/lib/infer/infer/bin/infer analyzejson --debug-level 1 --pulse --no-biabduction --cfg-json cfg.json --tenv-json tenv.json --sarif",
						"wsl -u root cp -r ~/infer-out/ " + inputPath,
					];
					let child = cp.spawn(analysisCommands.join(' ; '), [], { shell: 'powershell.exe' });
					child.stdout.on('data', data => infersharpConsole.append(data.toString()));
					child.stderr.on('data', data => infersharpConsole.append(data.toString()));
					child.on('exit', async () => {
						const sarifExt = vscode.extensions.getExtension('MS-SarifVSCode.sarif-viewer');
						if (!sarifExt?.isActive) {
							await sarifExt?.activate();
						}
						await sarifExt?.exports.openLogs([vscode.Uri.file(fileUri[0].path + '/infer-out/report.sarif')]);
					});
				}
				else {
					infersharpConsole.appendLine("No valid folder given.");
				}
			});
		}
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
