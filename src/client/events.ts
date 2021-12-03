import * as vscode from "vscode";
import { SET_API_KEY_CMD, SET_API_URI_CMD, SET_SPACE_CMD } from "./constants";
import { OclOutline } from "./services/ocl-outline-provider";
import { OctopusExplorer } from "./services/octopus-explorer-provider";
import { OctopusDeploySettings } from "./settings";

export function registerAuthSetup(context: vscode.ExtensionContext): void {
	const settings = OctopusDeploySettings.instance;

	context.subscriptions.push(vscode.commands.registerCommand(SET_API_KEY_CMD, async () => {
		const apiKeyInput = await vscode.window.showInputBox();
		await settings.storeSettings(apiKeyInput, undefined, undefined);
	}));

	context.subscriptions.push(vscode.commands.registerCommand(SET_API_URI_CMD, async () => {
		const apiUriInput = await vscode.window.showInputBox();
		await settings.storeSettings(undefined, apiUriInput, undefined);
	}));

	context.subscriptions.push(vscode.commands.registerCommand(SET_SPACE_CMD, async () => {
		const spaceInput = await vscode.window.showInputBox();
		await settings.storeSettings(undefined, undefined, spaceInput);
	}));
}

export async function registerOclOutlineProvider(context: vscode.ExtensionContext): Promise<void> {
	new OclOutline();
}

export async function registerOctopusExplorerProvider(context: vscode.ExtensionContext): Promise<void> {
	new OctopusExplorer(context);
}