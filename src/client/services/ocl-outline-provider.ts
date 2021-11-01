import * as vscode from 'vscode';
import {
	AST,
	Lexer,
	ASTNode,
	NodeType,
	Parser,
	LiteralType
} from '@octopusdeploy/ocl';
import { OCL_EXPLORER_ID, OCL_LANGUAGE_ID, OCL_OUTLINE_ADD_ENTRY_CMD, OCL_OUTLINE_REFRESH_ENTRY_CMD, OPEN_TO_POSITION_CMD, EXTENSION_CONFIGURATION_KEY } from '../constants';

export class OclOutlineProvider implements vscode.TreeDataProvider<ASTNode> {
	constructor(private workspaceRoot: string | undefined) {
		if (vscode.window.activeTextEditor) {
			var activeDocument = vscode.window.activeTextEditor.document;

			if (activeDocument && activeDocument.languageId === OCL_LANGUAGE_ID) {
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

			if (activeDocument && activeDocument.languageId === OCL_LANGUAGE_ID) {
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
		const label = 'name' in item ? item.name.value : '';

		const treeItem = new vscode.TreeItem(label, state);

		if ('name' in item) {
			treeItem.command = {
				command: OPEN_TO_POSITION_CMD,
				title: '',
				tooltip: ``,
				arguments: [item.name.ln - 1]
			};
		}

		var description = '';
		if ('labels' in item) {
			if (item.labels?.length) {
				for (const label of item.labels) {
					description = label.value.value + ' ';
				}
				description = description.trim();
			}
		}
		treeItem.description = description;

		switch (item.type) {
			case NodeType.ATTRIBUTE_NODE:
				treeItem.iconPath = new vscode.ThemeIcon('symbol-property');
				if (item.children.length > 0) {
					const child = item.children[0];
					switch (child.type) {
						case NodeType.ARRAY_NODE:
							treeItem.iconPath = new vscode.ThemeIcon('array');
							break;
						case NodeType.LITERAL_NODE:
							treeItem.description = child.value.value;
							treeItem.iconPath = new vscode.ThemeIcon('symbol-string');
							if (child.literalType === LiteralType.TRUE || child.literalType === LiteralType.FALSE) {
								treeItem.iconPath = new vscode.ThemeIcon('symbol-boolean');
							}
							if (child.literalType === LiteralType.INTEGER || child.literalType === LiteralType.DECIMAL) {
								treeItem.iconPath = new vscode.ThemeIcon('symbol-number');
							}
							break;
						case NodeType.DICTIONARY_NODE:
							treeItem.iconPath = new vscode.ThemeIcon('list-unordered');
							break;
					}
				}
				break;
			case NodeType.BLOCK_NODE:
				if (item.name.value === 'action') {
					treeItem.iconPath = new vscode.ThemeIcon('play');
				} else {
					treeItem.iconPath = new vscode.ThemeIcon('symbol-module');
				}
				break;
			default:
				treeItem.iconPath = new vscode.ThemeIcon('symbol-property');
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
	private oclOutlineProvider;
	private userSettings = vscode.workspace.getConfiguration(EXTENSION_CONFIGURATION_KEY);
	private timeoutRef?: NodeJS.Timeout;
	private onChangeDisposable?: vscode.Disposable;
	private onSaveDisposable?: vscode.Disposable;

	constructor() {
		this.oclOutlineProvider = new OclOutlineProvider(vscode.workspace.rootPath);

		this.setActiveEditorOclContext(vscode.window.activeTextEditor?.document.languageId === 'ocl');

		vscode.window.registerTreeDataProvider(OCL_EXPLORER_ID, this.oclOutlineProvider);
		vscode.window.onDidChangeActiveTextEditor(e => {
			if (e?.document.languageId === OCL_LANGUAGE_ID) {
				this.setActiveEditorOclContext(true);
				this.oclOutlineProvider.refresh();
			} else {
				this.oclOutlineProvider.clear();
				this.setActiveEditorOclContext(false);
			}
		});

		vscode.commands.registerCommand(OCL_OUTLINE_REFRESH_ENTRY_CMD, () => this.oclOutlineProvider.refresh());
		vscode.commands.registerCommand(OCL_OUTLINE_ADD_ENTRY_CMD, () => {
			vscode.commands.executeCommand('workbench.action.files.newUntitledFile')
				.then(_ => {
					if (vscode.window.activeTextEditor) {
						vscode.languages.setTextDocumentLanguage(vscode.window.activeTextEditor.document, OCL_LANGUAGE_ID);
						this.setActiveEditorOclContext(true);
					}
				});
		});
		vscode.commands.registerCommand(OPEN_TO_POSITION_CMD, lineNumber => vscode.commands.executeCommand('revealLine', {
			lineNumber: lineNumber,
			at: 'top'
		}));

		this.setOclRefreshBehaviour();
		vscode.workspace.onDidChangeConfiguration(_ => {
			this.userSettings = vscode.workspace.getConfiguration(EXTENSION_CONFIGURATION_KEY);
			this.onSaveDisposable?.dispose();
			this.onChangeDisposable?.dispose();
			this.setOclRefreshBehaviour();
		});
	}

	private setOclRefreshBehaviour() {
		if (this.userSettings.get('oclTreeRefreshType') === 'automatic') {
			this.onChangeDisposable = vscode.workspace.onDidChangeTextDocument(_ => {
				if (this.timeoutRef) {
					clearTimeout(this.timeoutRef);
				}
				this.timeoutRef = setTimeout(() => {
					this.oclOutlineProvider.refresh();
				}, this.userSettings.get('oclTreeRefreshInterval'));
			});
		}

		if (this.userSettings.get('oclTreeRefreshType') === 'on save') {
			this.onSaveDisposable = vscode.workspace.onDidSaveTextDocument(_ => this.oclOutlineProvider.refresh());
		}
	}

	private setActiveEditorOclContext(isOcl: boolean) {
		vscode.commands.executeCommand('setContext', 'octopus.activeEditorIsOcl', isOcl);
	}
}