import * as vscode from 'vscode';
import { LanguageClientOptions } from 'vscode-languageclient';
import { LanguageClient } from 'vscode-languageclient/browser';
import { EXTENSION_ACTIVATED, EXTENSION_ID, EXTENSION_SERVER_IS_READY, LANGUAGE_CLIENT_NAME, OCL_LANGUAGE_ID } from './constants';
import { registerAuthSetup, registerOclOutlineProvider, registerOctopusExplorerProvider } from './events';
import { OctopusDeploySettings } from './settings';

export async function activate(context: vscode.ExtensionContext) {
    console.log(EXTENSION_ACTIVATED);

    OctopusDeploySettings.init(context);
    registerAuthSetup(context);

    await registerOclOutlineProvider(context);
    await registerOctopusExplorerProvider(context);

    const documentSelector = [{ language: OCL_LANGUAGE_ID }];
    const clientOptions: LanguageClientOptions = {
        documentSelector,
        synchronize: {},
        initializationOptions: {},
    };

    const client = createWorkerLanguageClient(context, clientOptions);
    context.subscriptions.push(client.start());

    client.onReady().then(() => {
        console.log(EXTENSION_SERVER_IS_READY);
    });
}

function createWorkerLanguageClient(context: vscode.ExtensionContext, clientOptions: LanguageClientOptions) {
    // create worker; implements the language server
    const serverMain = vscode.Uri.joinPath(context.extensionUri, 'dist/server/browserServerMain.js');
    const worker = new Worker(serverMain.toString());

    // create the client to communicate with language server running in worker
    return new LanguageClient(EXTENSION_ID, LANGUAGE_CLIENT_NAME, clientOptions, worker);
}
