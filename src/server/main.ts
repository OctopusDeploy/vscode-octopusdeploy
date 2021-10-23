import { createConnection, BrowserMessageReader, BrowserMessageWriter } from 'vscode-languageserver/browser';
import { InitializeParams, InitializeResult, ServerCapabilities, TextDocuments } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';

const extensionId = 'vscode-octopusdeploy';

console.log(`running server ${extensionId}`);

const messageReader = new BrowserMessageReader(self);
const messageWriter = new BrowserMessageWriter(self);
const connection = createConnection(messageReader, messageWriter);

connection.onInitialize((params: InitializeParams): InitializeResult => {
	const capabilities: ServerCapabilities = {
	};
	return { capabilities };
});

// track open, change and close text document events
const documents = new TextDocuments(TextDocument);
documents.listen(connection);

// listen on the connection
connection.listen();