import * as path from 'path';
import * as vscode from 'vscode';
import { OCTOPUS_EXPLORER_ID } from "../constants";
import { OctopusDeploySettings } from "../settings";
import { Client, Repository } from '@octopusdeploy/api-client';
import { ChannelResource, NamedResource, ProjectGroupResource, ProjectResource, SpaceResource, TenantResource } from '@octopusdeploy/message-contracts';

function isChannel(resource: NamedResource | ChannelResource): resource is ChannelResource {
	return (<ChannelResource>resource).LifecycleId !== undefined && (<ChannelResource>resource).ProjectId !== undefined;
}

function isProjectGroup(resource: NamedResource | ProjectGroupResource): resource is ProjectGroupResource {
	return (<ProjectGroupResource>resource).RetentionPolicyId !== undefined;
}

function isProject(resource: NamedResource | ProjectResource): resource is ProjectResource {
	return (<ProjectResource>resource).ProjectGroupId !== undefined;
}

function isSpace(resource: NamedResource | SpaceResource): resource is SpaceResource {
	return (<SpaceResource>resource).TaskQueueStopped !== undefined;
}

function isTenant(resource: NamedResource | TenantResource): resource is TenantResource {
	return (<TenantResource>resource).ClonedFromTenantId !== undefined;
}

export class OctopusDeployModel {
	public connect(spaceId?: string): Thenable<Client> {
		return new Promise(async (c, e) => {
			try {
				const settings = await OctopusDeploySettings.instance.getSettings();
				return c(Client.create({
					apiKey: settings.apiKey,
					apiUri: settings.apiUri,
					autoConnect: true,
					space: spaceId
				}));
			} catch (err) {
				e(err);
			}
		});
	}

	public getChannels(project: ProjectResource): Thenable<ChannelResource[]> {
		return this.connect(project.SpaceId).then(client => {
			return new Promise(async (c, e) => {
				try {
					const channels = await new Repository(client).channels.listFromProject(project);
					c(channels.Items);
				} catch (err) {
					e(err);
				}
			});
		});
	}

	public getProjectGroups(space: SpaceResource): Thenable<ProjectGroupResource[]> {
		return this.connect(space.Id).then(client => {
			return new Promise(async (c, e) => {
				try {
					const projectGroups = await new Repository(client).projectGroups.list();
					c(projectGroups.Items);
				} catch (err) {
					e(err);
				}
			});
		});
	}

	public getProjects(projectGroup: ProjectGroupResource): Thenable<ProjectResource[]> {
		return this.connect(projectGroup.SpaceId).then(client => {
			return new Promise(async (c, e) => {
				try {
					const projects = await new Repository(client).projects.listByGroup(projectGroup);
					c(projects.Items);
				} catch (err) {
					e(err);
				}
			});
		});
	}

	public getTenants(space: SpaceResource): Thenable<TenantResource[]> {
		return this.connect(space.Id).then(client => {
			return new Promise(async (c, e) => {
				try {
					const projects = await new Repository(client).tenants.list();
					c(projects.Items);
				} catch (err) {
					e(err);
				}
			});
		});
	}

	public get spaces(): Thenable<SpaceResource[]> {
		return this.connect().then(client => {
			return new Promise(async (c, e) => {
				try {
					const spaces = await new Repository(client).spaces.list();
					c(spaces.Items);
				} catch (err) {
					e(err);
				}
			});
		});
	}
}

export class SpaceTreeItem extends vscode.TreeItem {
	constructor(private context: vscode.ExtensionContext, private space: SpaceResource) {
		super(space.Name, vscode.TreeItemCollapsibleState.Collapsed);
		this.iconPath = {
			light: this.context.asAbsolutePath(path.join('assets', 'icons', 'octopus-deploy.svg')),
			dark: this.context.asAbsolutePath(path.join('assets', 'icons', 'octopus-deploy.svg'))
		};
	}

	async getProjectGroups(): Promise<vscode.TreeItem[]> {
		return new Promise(async (c, e) => {
			try {
				const items: vscode.TreeItem[] = [new vscode.TreeItem("test")];
				c(items);
			} catch (err) {
				e(err);
			}
		});
	}

	async getChildren(): Promise<vscode.TreeItem[] | undefined> {
		return new Promise(async (c, e) => {
			try {
				c(await this.getProjectGroups());
			} catch (err) {
				e(err);
			}
		});
	}
}

export class OctopusDeployTreeDataProvider implements vscode.TreeDataProvider<NamedResource> {
	constructor(private context: vscode.ExtensionContext, private readonly model: OctopusDeployModel) { }

	public getChildren(element?: NamedResource): vscode.ProviderResult<NamedResource[]> {
		if (element === undefined) { return this.model.spaces; }
		if (isSpace(element)) { return this.model.getProjectGroups(element); }
		if (isProjectGroup(element)) { return this.model.getProjects(element); }
		if (isProject(element)) { return this.model.getChannels(element); }
		return [];
	}

	public getTreeItem(element: NamedResource): vscode.TreeItem | Thenable<vscode.TreeItem> {
		if (isSpace(element)) {
			return new SpaceTreeItem(this.context, element);
		}

		const treeItem = new vscode.TreeItem(element.Name, vscode.TreeItemCollapsibleState.Collapsed);

		if (isTenant(element)) {
			treeItem.iconPath = new vscode.ThemeIcon('person');
			return treeItem;
		}

		if (isProjectGroup(element)) {
			treeItem.iconPath = new vscode.ThemeIcon('group-by-ref-type');
			return treeItem;
		}

		if (isProject(element)) {
			treeItem.iconPath = new vscode.ThemeIcon('project');
			return treeItem;
		}

		if (isChannel(element)) {
			treeItem.iconPath = new vscode.ThemeIcon('arrow-down');
			return treeItem;
		}

		return treeItem;
	}
}

export class OctopusExplorer {
	private octopusViewer: vscode.TreeView<NamedResource>;

	constructor(context: vscode.ExtensionContext) {
		const model = new OctopusDeployModel();
		const treeDataProvider = new OctopusDeployTreeDataProvider(context, model);

		this.octopusViewer = vscode.window.createTreeView(OCTOPUS_EXPLORER_ID, { treeDataProvider });
	}
}