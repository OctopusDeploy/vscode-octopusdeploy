import * as vscode from 'vscode';

const extensionId = 'vscode-octopusdeploy';

export function activate(context: vscode.ExtensionContext) {
	console.log(`Extension "${extensionId}" activated.`);
}

export function deactivate() {}