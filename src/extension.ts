// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { CloudUIProvider } from './cloudUIDependance';
import { appendFiles, isFolder } from './fsio';
import { CloudUIWebviewBootstrap } from './cloudUIDisplayWebview';
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// check if cloud ui is imported
	const workspace = vscode.workspace.workspaceFolders;
	if(!workspace || workspace.length === 0){
		return;
	}
	const targetWorkspace = workspace[0];
	//context.workspaceState.get()
	// fetch all cloud ui from workspace node_modules
	if(checkCloudUI(targetWorkspace)){
		const { uri } =  targetWorkspace;
		const Provider = new CloudUIProvider(uri.path);
		vscode.window.registerTreeDataProvider('cloudUIDependence', Provider);
		// vscode.window.registerTreeDataProvider('cloudUIDependence2', Provider);
		vscode.commands.registerCommand('extension.openUIMarkDown',
			(uiName, abspath) =>{
				// vscode.commands.executeCommand('markdown.showPreview', vscode.Uri.file(path.join(abspath, 'README.md')));
				vscode.commands.executeCommand('clouduidoc.glance', uiName, abspath)
			});


		CloudUIWebviewBootstrap(context, uri.path);
		context.subscriptions.push(
			vscode.commands.registerCommand('clouduidoc.addFolder', async (clickedFile: vscode.Uri) => {
				const path = clickedFile.fsPath;
				if(isFolder(path)){
					await appendFiles(path)
					vscode.commands.executeCommand('workbench.files.action.refreshFilesExplorer')
				}
			})
		);
	}else{
		vscode.window.showErrorMessage('当前项目下不存在cloud UI，执行npm i cloud-ui.vusion安装');
	}

}

export function deactivate() {}


function checkCloudUI(targetWorkspace: vscode.WorkspaceFolder): Boolean{
	const { uri } =  targetWorkspace;
	const packageJsonPath = path.resolve(uri.path, 'package.json');
	if(fs.existsSync(packageJsonPath)){
		const packageObject = require(packageJsonPath);
		return packageObject.dependencies['vusion-ui.vusion'] || packageObject.dependencies['cloud-ui.vusion']
	}
	return false;
}