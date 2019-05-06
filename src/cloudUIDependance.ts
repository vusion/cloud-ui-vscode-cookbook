import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class CloudUIProvider implements vscode.TreeDataProvider<CloudUI> {

	private _onDidChangeTreeData: vscode.EventEmitter<CloudUI | undefined> = new vscode.EventEmitter<CloudUI | undefined>();
	readonly onDidChangeTreeData: vscode.Event<CloudUI | undefined> = this._onDidChangeTreeData.event;

	constructor(private workspaceRoot: string) {
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: CloudUI): vscode.TreeItem {
		return element;
	}

	getChildren(element?: CloudUI): Thenable<CloudUI[]> {
		if (!this.workspaceRoot) {
			vscode.window.showInformationMessage('No dependency in empty workspace');
			return Promise.resolve([]);
		}

        const cloudUIPath = path.resolve(this.workspaceRoot, 'node_modules/cloud-ui.vusion/src');
        if (this.pathExists(cloudUIPath)) {
            return Promise.resolve(this.getCloudUIInDependance(cloudUIPath));
        } else {
            vscode.window.showInformationMessage('cloud-ui.vusion');
            return Promise.resolve([]);
        }


    }

    private getCloudUIInDependance(cloudUIPath: string): CloudUI[]{
        const dir = fs.readdirSync(cloudUIPath);
        // maybe can read MD file
        return dir.filter(component => {
            if(!component.endsWith('.vue'))
                return false;
            const dir = fs.readdirSync(path.join(cloudUIPath, component));
            return dir.indexOf('README.md') !== -1;
        }).map(component => new CloudUI(component, 'xxx', vscode.TreeItemCollapsibleState.None, {
            command: 'extension.openUIMarkDown',
            title: '',
            arguments: [component, path.join(cloudUIPath, component)]
        }))
    }

	private pathExists(p: string): boolean {
		try {
			fs.accessSync(p);
		} catch (err) {
			return false;
		}

		return true;
	}
}

export class CloudUI extends vscode.TreeItem {

	constructor(
		public readonly label: string,
		public readonly brief: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command,

	) {
        super(label, collapsibleState);
        this.brief = brief;
	}

	get tooltip(): string {
		return `${this.label}`;
	}

	get description(): string  {
		return this.brief;
	}

	// iconPath = {
	// 	light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
	// 	dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
	// };

	contextValue = 'dependency';

}