import { createConnection, BrowserMessageReader, BrowserMessageWriter } from 'vscode-languageserver/browser';
import { InitializeParams, InitializeResult, ServerCapabilities, TextDocuments } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { EXTENSION_ID } from './constants';

console.log(`running server ${EXTENSION_ID}`);

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