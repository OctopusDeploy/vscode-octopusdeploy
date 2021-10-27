import { ExtensionContext, Uri } from 'vscode';
import { LanguageClientOptions } from 'vscode-languageclient';
import { LanguageClient } from 'vscode-languageclient/browser';
import { EXTENSION_ID, LANGUAGE_CLIENT_NAME, OCL_LANGUAGE_ID, SETUP_API_KEY_CMD } from './constants';
import { OclOutline } from './services/ocl-outline-provider';

export function activate(context: ExtensionContext) {
	console.log(`${EXTENSION_ID} activated.`);

	new OclOutline();

	const documentSelector = [{ language: OCL_LANGUAGE_ID }];
	const clientOptions: LanguageClientOptions = {
		documentSelector,
		synchronize: {},
		initializationOptions: {}
	};

	const client = createWorkerLanguageClient(context, clientOptions);
	const disposable = client.start();
	context.subscriptions.push(disposable);

	client.onReady().then(() => {
		console.log(`${EXTENSION_ID} server is ready`);
	});
}

function createWorkerLanguageClient(context: ExtensionContext, clientOptions: LanguageClientOptions) {
	// create worker; implements the language server
	const serverMain = Uri.joinPath(context.extensionUri, 'dist/server/browserServerMain.js');
	const worker = new Worker(serverMain.toString());

	// create the client to communicate with language server running in worker
	return new LanguageClient(EXTENSION_ID, LANGUAGE_CLIENT_NAME, clientOptions, worker);
}
