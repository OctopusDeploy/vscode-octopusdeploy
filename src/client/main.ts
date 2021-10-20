import { ExtensionContext, Uri, window, workspace } from 'vscode';
import { LanguageClientOptions } from 'vscode-languageclient';
import { LanguageClient } from 'vscode-languageclient/browser';
import { OclOutlineProvider } from './OclOutlineProvider';

const extensionId = 'vscode-octopusdeploy';
const languageClientName = 'Octopus Deploy for Visual Studio Code';

export function activate(context: ExtensionContext) {
	console.log(`${extensionId} activated.`);

	window.registerTreeDataProvider(
		'oclOutline',
		new OclOutlineProvider(workspace.rootPath)
	);

	const documentSelector = [{ language: 'ocl' }];
	const clientOptions: LanguageClientOptions = {
		documentSelector,
		synchronize: {},
		initializationOptions: {}
	};

	const client = createWorkerLanguageClient(context, clientOptions);
	const disposable = client.start();
	context.subscriptions.push(disposable);

	client.onReady().then(() => {
		console.log(`${extensionId} server is ready`);
	});
}

function createWorkerLanguageClient(context: ExtensionContext, clientOptions: LanguageClientOptions) {
	// create worker; implements the language server
	const serverMain = Uri.joinPath(context.extensionUri, 'dist/server/browserServerMain.js');
	const worker = new Worker(serverMain.toString());

	// create the client to communicate with language server running in worker
	return new LanguageClient(extensionId, languageClientName, clientOptions, worker);
}
