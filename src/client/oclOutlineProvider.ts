import * as vscode from 'vscode';

export class OclOutlineProvider implements vscode.TreeDataProvider<OclNode> {
	constructor(private workspaceRoot: string | undefined) { }

	onDidChangeTreeData?: vscode.Event<void | OclNode | null | undefined> | undefined;

	getTreeItem(element: OclNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
		return element;
	}

	getChildren(element?: OclNode): Thenable<OclNode[]> {
		var node = new Array<OclNode>();

		// HACK: Put stub content in tree-view and prevent infinite loop
		if (element && !element.label.match("Step 1")) {
			// Root element exists - Create child element/s
			node.push(new OclNode("Step 1", 2, vscode.TreeItemCollapsibleState.Collapsed));
			return Promise.resolve(node);
		} else if (!element) {
			// Element undefined on method entry - Create root element
			node.push(new OclNode("Root", 1, vscode.TreeItemCollapsibleState.Expanded));
		}

		return Promise.resolve(node);
	}

}

class OclNode extends vscode.TreeItem {
	constructor(
		public readonly label: string,
		private readonly position: number,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState
	) {
		super(label, collapsibleState);
	}
}