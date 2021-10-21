import * as vscode from 'vscode';

export class OclOutlineProvider implements vscode.TreeDataProvider<OclStepNode> {
	constructor(private workspaceRoot: string | undefined) { }

	private _onDidChangeTreeData: vscode.EventEmitter<OclStepNode | undefined | null | void> = new vscode.EventEmitter<OclStepNode | undefined | null | void>();
	readonly onDidChangeTreeData: vscode.Event<OclStepNode | undefined | null | void> = this._onDidChangeTreeData.event;

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: OclStepNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
		return element;
	}

	getChildren(element?: OclStepNode): Thenable<OclStepNode[]> {
		var nodes = new Array<OclStepNode>();
		var activeDocument = vscode.window.activeTextEditor?.document;

		if (!activeDocument || !activeDocument.languageId.match("ocl")) {
			return Promise.resolve(nodes);
		}

		if (!element) {
			for (let index = 0; index < activeDocument.lineCount; index++) {
				const line = activeDocument.lineAt(index);
				if (line.text.startsWith("step")) {
					nodes.push(new OclStepNode(this.getNodeLabel(line.text), vscode.TreeItemCollapsibleState.None, {
						command: 'octopusDeploy.openToPosition',
						title: '',
						arguments: [index]
					}));
				}
			}
		}

		return Promise.resolve(nodes);
	}

	private getNodeLabel(lineText: string): string {
		return lineText.split('"')[1];
	}

}

class OclStepNode extends vscode.TreeItem {
	constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);
	}

	iconPath = new vscode.ThemeIcon("list-tree");
}

export class OclOutline {
	constructor() {
		const oclOutlineProvider = new OclOutlineProvider(vscode.workspace.rootPath);

		vscode.window.registerTreeDataProvider('oclOutline', oclOutlineProvider);
		vscode.window.onDidChangeActiveTextEditor(() => oclOutlineProvider.refresh());

		vscode.commands.registerCommand('oclOutline.refreshEntry', () => oclOutlineProvider.refresh());
		// TODO - create custom command to set language mode
		vscode.commands.registerCommand('oclOutline.addEntry', () => vscode.commands.executeCommand('workbench.action.files.newUntitledFile'));
		vscode.commands.registerCommand('octopusDeploy.openToPosition', lineNumber => vscode.commands.executeCommand('revealLine', {
			lineNumber: lineNumber,
			at: "top"
		}));
	}
}