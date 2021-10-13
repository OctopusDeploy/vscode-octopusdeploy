import * as vscode from 'vscode';

export const ActionTypeCompletionItem = new vscode.CompletionItem('action_type', vscode.CompletionItemKind.Property);
ActionTypeCompletionItem.commitCharacters = ['='];
ActionTypeCompletionItem.documentation = new vscode.MarkdownString('Press `=` to see possible values.');

export const CompletionProvider = vscode.languages.registerCompletionItemProvider('ocl', {
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {
        return [
            ActionTypeCompletionItem
        ];
    },
});