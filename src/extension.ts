import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as utils from './utils';

export function activate(context: vscode.ExtensionContext) {
	let infersharpConsole = vscode.window.createOutputChannel("InferSharp");
	infersharpConsole.show();
	let disposable = vscode.commands.registerCommand('infersharp-ext.analyze', () => {
		const options: vscode.OpenDialogOptions = {
			canSelectMany: false,
			openLabel: 'Open',
			canSelectFiles: false,
			canSelectFolders: true,
			defaultUri: vscode.workspace.workspaceFolders === undefined ? undefined : vscode.workspace.workspaceFolders[0].uri
	   };
		let res = cp.spawnSync(utils.CHECK_SETUP, { shell: 'powershell.exe' });
		if (res.status !== 0) {
			infersharpConsole.appendLine("Expected binaries not detected; please wait while they are downloaded and extracted.");
			let analysisCommands = [
				utils.INSTALL_WSL_UBUNTU,
				utils.TRY_GET_INFERSHARP_BINARIES,
				utils.UNZIP_BINARIES,
				utils.runWslUbuntu(utils.remove(utils.INFERSHARP_TAR_GZ)),
				utils.SET_WSL_DEFAULT_UBUNTU,
				utils.print('Setup complete. You may now run InferSharp!'),
			];
			let setup = cp.spawn(analysisCommands.join(' ; '), { shell: 'powershell.exe' });
			setup.stdout.on('data', data => infersharpConsole.append(data.toString()));
			setup.stderr.on('data', data => infersharpConsole.append(data.toString()));
		}
		else {
			infersharpConsole.clear();
			vscode.window.showOpenDialog(options).then(async fileUri => {
				if (fileUri && fileUri[0]) {
					let monitor = cp.spawn(utils.MONITOR, [], { shell: 'powershell.exe' });
					monitor.stdout.on('data', data => infersharpConsole.append(data.toString()));
					let drivePrefix = fileUri[0].path.split('/')[1];
					let newDrivePrefix = drivePrefix.replace(':', '').toLowerCase();
					let inputPath = "//mnt/" + newDrivePrefix + '/' + fileUri[0].path.substring(drivePrefix.length + 2);
					infersharpConsole.appendLine('InferSharp is analyzing: ' + inputPath);
					let analysisCommands = [
						utils.runWsl(utils.remove(utils.INFER_OUT)),
						utils.print('Beginning translation.'),
						utils.translateAndMove(inputPath),
						utils.print('Translation complete. Beginning analysis.'),
						utils.inferAnalyze(inputPath),
					];
					let child = cp.spawn(analysisCommands.join(' ; '), [], { shell: 'powershell.exe' });
					child.stdout.on('data', data => infersharpConsole.append(data.toString()));
					child.stderr.on('data', data => infersharpConsole.append('ERROR: ' + data.toString()));
					child.on('kill', () => {
						monitor.kill();
						infersharpConsole.appendLine('InferSharp process killed.');
					});
					child.on('exit', async () => {
						monitor.kill();
						const sarifExt = vscode.extensions.getExtension('MS-SarifVSCode.sarif-viewer');
						if (!sarifExt?.isActive) {
							await sarifExt?.activate();
						}
						await sarifExt?.exports.openLogs([vscode.Uri.file(fileUri[0].path + '/' + utils.INFER_OUT + 'report.sarif')]);
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

export function deactivate() {}
