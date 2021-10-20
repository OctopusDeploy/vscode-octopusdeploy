import * as vscode from 'vscode';

export class OclOutlineProvider implements vscode.TreeDataProvider<OclNode> {
	constructor(private workspaceRoot: string | undefined) { }

	private _onDidChangeTreeData: vscode.EventEmitter<OclNode | undefined | null | void> = new vscode.EventEmitter<OclNode | undefined | null | void>();
	readonly onDidChangeTreeData: vscode.Event<OclNode | undefined | null | void> = this._onDidChangeTreeData.event;

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: OclNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
		return element;
	}

	getChildren(element?: OclNode): Thenable<OclNode[]> {
		const treeRootLabel = "Document Root";
		var nodes = new Array<OclNode>();
		var activeDocument = vscode.window.activeTextEditor?.document;


		if (!activeDocument || !activeDocument.languageId.match("ocl")) {
			return Promise.resolve(nodes);
		} else if (!element) {
			nodes.push(new OclNode(treeRootLabel, vscode.TreeItemCollapsibleState.Expanded));
			return Promise.resolve(nodes);
		} else if (element && element.label.match(treeRootLabel)) {
			for (let index = 0; index < activeDocument.lineCount; index++) {
				const line = activeDocument.lineAt(index);
				if (line.text.startsWith("step")) {
					nodes.push(new OclNode(this.getNodeLabel(line.text), vscode.TreeItemCollapsibleState.None, {
						command: 'extension.openToPosition',
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

class OclNode extends vscode.TreeItem {
	constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);
	}
}