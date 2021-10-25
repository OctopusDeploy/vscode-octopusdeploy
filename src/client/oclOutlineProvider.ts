import * as vscode from 'vscode';
import {
	AST,
	BlockNode,
	Lexer,
	ASTNode,
	NodeType,
	Parser,
	AttributeNode,
	LiteralType
} from '@octopusdeploy/ocl';

export class OclOutlineProvider implements vscode.TreeDataProvider<ASTNode> {
	constructor(private workspaceRoot: string | undefined) {
		if (vscode.window.activeTextEditor) {
			var activeDocument = vscode.window.activeTextEditor.document;

			if (activeDocument) {
				const text = activeDocument.getText();
				const lexer = new Lexer(text);
				const parser = new Parser(lexer);
				this.ast = parser.getAST();
			}
		}
	}

	public ast: AST = [];

	private _onDidChangeTreeData: vscode.EventEmitter<ASTNode | undefined | null | void> = new vscode.EventEmitter<ASTNode | undefined | null | void>();
	readonly onDidChangeTreeData: vscode.Event<ASTNode | undefined | null | void> = this._onDidChangeTreeData.event;

	clear() {
		this.ast = [];
		this._onDidChangeTreeData.fire();
	}

	refresh(): void {
		if (vscode.window.activeTextEditor) {
			var activeDocument = vscode.window.activeTextEditor.document;

			if (activeDocument) {
				const text = activeDocument.getText();
				const lexer = new Lexer(text);
				const parser = new Parser(lexer);
				this.ast = parser.getAST();
			}
		}
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(item: ASTNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
		const numberOfBlockChildren = item.children?.filter(n => n.type === NodeType.BLOCK_NODE || n.type === NodeType.ATTRIBUTE_NODE).length;
		const state = numberOfBlockChildren === 0 ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Expanded;
		const label = "name" in item ? item.name.value : "";

		const treeItem = new vscode.TreeItem(label, state);

		if ("name" in item) {
			treeItem.command = {
				command: 'octopusDeploy.openToPosition',
				title: '',
				tooltip: ``,
				arguments: [item.name.ln - 1]
			};
		}

		var description = '';
		if ("labels" in item) {
			if (item.labels?.length) {
				for (const label of item.labels) {
					description = label.value.value + " ";
				}
				description = description.trim();
			}
		}
		treeItem.description = description;

		switch (item.type) {
			case NodeType.ATTRIBUTE_NODE:
				treeItem.iconPath = new vscode.ThemeIcon("symbol-property");
				if (item.children.length > 0) {
					const child = item.children[0];
					switch (child.type) {
						case NodeType.ARRAY_NODE:
							treeItem.iconPath = new vscode.ThemeIcon("array");
							break;
						case NodeType.LITERAL_NODE:
							treeItem.description = child.value.value;
							treeItem.iconPath = new vscode.ThemeIcon("symbol-string");
							if (child.literalType === LiteralType.TRUE || child.literalType === LiteralType.FALSE) {
								treeItem.iconPath = new vscode.ThemeIcon("symbol-boolean");
							}
							if (child.literalType === LiteralType.INTEGER || child.literalType === LiteralType.DECIMAL) {
								treeItem.iconPath = new vscode.ThemeIcon("symbol-number");
							}
							break;
						case NodeType.DICTIONARY_NODE:
							treeItem.iconPath = new vscode.ThemeIcon("list-unordered");
							break;
					}
				}
				break;
			case NodeType.BLOCK_NODE:
				if (item.name.value === "action") {
					treeItem.iconPath = new vscode.ThemeIcon("play");
				} else {
					treeItem.iconPath = new vscode.ThemeIcon("symbol-module");
				}
				break;
			default:
				treeItem.iconPath = new vscode.ThemeIcon("symbol-property");
				break;
		}

		return treeItem;
	}

	getChildren(item?: ASTNode): vscode.ProviderResult<ASTNode[]> {
		if (item) {
			return item.children?.filter(n => n.type === NodeType.BLOCK_NODE || n.type === NodeType.ATTRIBUTE_NODE);
		}
		return this.ast.filter(n => n.type === NodeType.BLOCK_NODE || n.type === NodeType.ATTRIBUTE_NODE);
	}
}

export class OclOutline {
	constructor() {
		const oclOutlineProvider = new OclOutlineProvider(vscode.workspace.rootPath);

		vscode.window.registerTreeDataProvider('oclOutline', oclOutlineProvider);
		vscode.window.onDidChangeActiveTextEditor(e => {
			if (e?.document.languageId === "ocl") {
				oclOutlineProvider.refresh();
			} else {
				oclOutlineProvider.clear();
			}
		});

		vscode.commands.registerCommand('oclOutline.refreshEntry', () => oclOutlineProvider.refresh());
		// TODO - create custom command to set language mode
		vscode.commands.registerCommand('oclOutline.addEntry', () => vscode.commands.executeCommand('workbench.action.files.newUntitledFile'));
		vscode.commands.registerCommand('octopusDeploy.openToPosition', lineNumber => vscode.commands.executeCommand('revealLine', {
			lineNumber: lineNumber,
			at: "top"
		}));
	}
}