import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
function readFirstLine(path: string): Thenable<string>{
    return new Promise((resolve, reject) => {
        const rs = fs.createReadStream(path, {encoding: 'utf8'});
        let acc = '';
        let pos = 0;
        let index = 0;
        rs
            .on('data', function (chunk) {
                index = chunk.indexOf('\n');
                acc += chunk;
                index !== -1 ? rs.close() : pos += chunk.length;
            })
            .on('close', function () {
                resolve(acc.slice(0, pos + index));
            })
            .on('error', function (err) {
                reject(err);
            })
    })

}
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
            return this.getCloudUIInDependance(cloudUIPath);
        } else {
            vscode.window.showInformationMessage('cloud-ui.vusion');
            return Promise.resolve([]);
        }


    }

    private getCloudUIInDependance(cloudUIPath: string): Thenable<CloudUI[]>{
        const dir = fs.readdirSync(cloudUIPath);
        // maybe can read MD file
        return Promise.all(dir.filter(component => {
            if(!component.endsWith('.vue'))
                return false;
            const dir = fs.readdirSync(path.join(cloudUIPath, component));
            return dir.indexOf('README.md') !== -1;
        }).map(component => {
            const targetPath = path.join(cloudUIPath, component);
            const READMEPath = path.join(targetPath, 'README.md');
            // const data = fs.readFileSync(READMEPath);
            return readFirstLine(READMEPath).then(data => {
                return new CloudUI(component, data, vscode.TreeItemCollapsibleState.None, {
                    command: 'extension.openUIMarkDown',
                    title: '',
                    arguments: [component, targetPath]
                })
            })
        }));
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