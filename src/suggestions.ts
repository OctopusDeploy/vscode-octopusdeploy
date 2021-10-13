import * as vscode from 'vscode';

const ActionTypeCompletionItemProvider = vscode.languages.registerCompletionItemProvider(
    'ocl',
    {
        provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
            const linePrefix = document.lineAt(position).text.substr(0, position.character);
            if (!linePrefix.endsWith('action_type=')) {
                return undefined;
            }

            return [
                new vscode.CompletionItem('"Octopus.AzurePowerShell"', vscode.CompletionItemKind.Value),
                new vscode.CompletionItem('"Octopus.Script"', vscode.CompletionItemKind.Value),
            ];
        },
    },
    '=',
);

export const SuggestionProviders = [
    ActionTypeCompletionItemProvider
];