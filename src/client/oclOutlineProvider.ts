import {
	commands,
	EventEmitter,
	ProviderResult,
	ThemeIcon,
	TreeDataProvider,
	TreeItem,
	TreeItemCollapsibleState,
	window,
	workspace
} from 'vscode';
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

export class OclOutlineProvider implements TreeDataProvider<ASTNode> {
	constructor(private workspaceRoot: string | undefined) {
		var activeDocument = window.activeTextEditor?.document;
		const lexer = new Lexer(activeDocument!.getText());
		const parser = new Parser(lexer);
		this.ast = parser.getAST();
	}

	public ast: AST = [];

	private _onDidChangeTreeData = new EventEmitter<BlockNode | undefined>();
	readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

	refresh(): void {
		console.log("refresh");
		this._onDidChangeTreeData.fire(undefined);
	}

	getTreeItem(item: BlockNode | AttributeNode): TreeItem | Thenable<TreeItem> {
		const numberOfBlockChildren = item.children.filter(n => n.type === NodeType.BLOCK_NODE || n.type === NodeType.ATTRIBUTE_NODE).length;
		const state = numberOfBlockChildren === 0 ? TreeItemCollapsibleState.None : TreeItemCollapsibleState.Expanded;

		const treeItem = new TreeItem(item.name.value, state);
		treeItem.command = {
			command: 'octopusDeploy.openToPosition',
			title: '',
			tooltip: ``,
			arguments: [item.name.ln - 1]
		};

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
				treeItem.iconPath = new ThemeIcon("symbol-property");
				if (item.children.length > 0) {
					const child = item.children[0];
					switch (child.type) {
						case NodeType.ARRAY_NODE:
							treeItem.iconPath = new ThemeIcon("array");
							break;
						case NodeType.LITERAL_NODE:
							treeItem.description = child.value.value;
							treeItem.iconPath = new ThemeIcon("symbol-string");
							if (child.literalType === LiteralType.TRUE || child.literalType === LiteralType.FALSE) {
								treeItem.iconPath = new ThemeIcon("symbol-boolean");
							}
							if (child.literalType === LiteralType.INTEGER || child.literalType === LiteralType.DECIMAL) {
								treeItem.iconPath = new ThemeIcon("symbol-number");
							}
							break;
						case NodeType.DICTIONARY_NODE:
							treeItem.iconPath = new ThemeIcon("list-unordered");
							break;
					}
				}
				break;
			case NodeType.BLOCK_NODE:
				if (item.name.value === "action") {
					treeItem.iconPath = new ThemeIcon("play");
				} else {
					treeItem.iconPath = new ThemeIcon("symbol-module");
				}
				break;
			default:
				treeItem.iconPath = new ThemeIcon("symbol-property");
				break;
		}

		treeItem.tooltip = `${treeItem.description} ${treeItem.label}`;

		return treeItem;
	}

	getChildren(item?: BlockNode | AttributeNode): ProviderResult<ASTNode[]> {
		if (item) {
			return item.children.filter(n => n.type === NodeType.BLOCK_NODE || n.type === NodeType.ATTRIBUTE_NODE);
		}
		return this.ast.filter(n => n.type === NodeType.BLOCK_NODE || n.type === NodeType.ATTRIBUTE_NODE);
	}
}

export class OclOutline {
	constructor() {
		const oclOutlineProvider = new OclOutlineProvider(workspace.rootPath);

		window.registerTreeDataProvider('oclOutline', oclOutlineProvider);
		window.onDidChangeActiveTextEditor(() => oclOutlineProvider.refresh());

		commands.registerCommand('oclOutline.refreshEntry', () => oclOutlineProvider.refresh());
		// TODO - create custom command to set language mode
		commands.registerCommand('oclOutline.addEntry', () => commands.executeCommand('workbench.action.files.newUntitledFile'));
		commands.registerCommand('octopusDeploy.openToPosition', lineNumber => commands.executeCommand('revealLine', {
			lineNumber: lineNumber,
			at: "top"
		}));
	}
}