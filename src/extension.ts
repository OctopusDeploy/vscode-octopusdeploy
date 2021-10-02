import * as vscode from 'vscode';

const extensionId = 'vscode-octopusdeploy';

export function activate(context: vscode.ExtensionContext) {
	console.log(`Extension "${extensionId}" activated.`);

	let disposable = vscode.commands.registerCommand('vscode-octopusdeploy.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from vscode-octopusdeploy!');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}