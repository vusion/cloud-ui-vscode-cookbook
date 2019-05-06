// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { CloudUIProvider } from './cloudUIDependance';
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
		vscode.commands.registerCommand('extension.openUIMarkDown',
			(uiName, abspath) =>
			vscode.commands.executeCommand('vscode.open', vscode.Uri.file(path.join(abspath, 'README.md'))));
	}else{
		vscode.window.showErrorMessage('当前项目下不存在cloud UI，执行npm i cloud-ui.vision安装');
	}


	// // The command has been defined in the package.json file
	// // Now provide the implementation of the command with registerCommand
	// // The commandId parameter must match the command field in package.json
	// let disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
	// 	// The code you place here will be executed every time your command is executed

	// 	// Display a message box to the user
	// 	vscode.window.showInformationMessage('Hello World!');
	// });

	// context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
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