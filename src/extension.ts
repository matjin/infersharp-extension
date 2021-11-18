// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as cp from 'child_process';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, InferSharp is now active!');
	let infersharpConsole = vscode.window.createOutputChannel("InferSharp");

	cp.exec('./setup.sh');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('infersharp-ext.helloWorld', () => {
		const options: vscode.OpenDialogOptions = {
			canSelectMany: false,
			openLabel: 'Open',
			canSelectFiles: false,
			canSelectFolders: true,
			defaultUri: vscode.workspace.workspaceFolders === undefined ? undefined : vscode.workspace.workspaceFolders[0].uri
	   };
		// The code you place here will be executed every time your command is executed
		vscode.window.showOpenDialog(options).then(fileUri => {
			if (fileUri && fileUri[0]) {
				cp.exec('./run.sh ' + fileUri, (err, stdout, stderr) => {
					infersharpConsole.appendLine('stdout: ' + stdout);
					infersharpConsole.appendLine('stderr: ' + stderr);
					if (err) {
						infersharpConsole.appendLine('error: ' + err);
					}
				});
			}
			else {
				infersharpConsole.appendLine("No valid folder given.");
			}
		});
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
