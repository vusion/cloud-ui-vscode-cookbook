import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as Vue from 'vue';
import * as VueRender from 'vue-server-renderer';

export function CloudUIWebviewBootstrap(context: vscode.ExtensionContext, workspaceRoot: string,){
    vscode.commands.registerCommand('clouduidoc.glance', (uiName: string, abspath: string) => {
        const panel = vscode.window.createWebviewPanel(
			'Cloud UI',
			'Cloud UI View',
			vscode.ViewColumn.One,
			{
				enableScripts: true,
			}
        );
        panel.title = 'Cloud UI - ' + uiName;
        function getMediaUri(pathComps: string[]){
            return vscode.Uri.file(path.join(context.extensionPath, ...pathComps)).with({ scheme: 'vscode-resource' });
        }

        // context.asAbsolutePath('media/xxx.png');
        // new WebViewRender(uiName, workspaceRoot, panel);
        panel.webview.html = _getHtmlForWebview(uiName, abspath, getMediaUri);
        panel.reveal();
    });
}

export class WebViewRender {
    READMEPath:string
    componentPath: string
    renderer: VueRender.Renderer

    constructor(uiName: string, workspaceRoot: string, panel: vscode.WebviewPanel){
        const cloudUIPath = path.resolve(workspaceRoot, 'node_modules/cloud-ui.vusion/src');

        const dir = fs.readdirSync(path.join(cloudUIPath, uiName));
        if(dir.indexOf('README.md') !== -1){
            this.READMEPath = path.join(cloudUIPath, uiName, 'README.md');
            this.componentPath = path.join(cloudUIPath, uiName, 'index.js');
            this.renderer = VueRender.createRenderer();
            try {
                const app = new Vue.default({
                    template: `<div>Hello World</div>`
                });
                console.log(app);
                this.renderer.renderToString(app, (err, html) => {
                    if (err) throw err
                    panel.webview.html = html;
                    panel.reveal();
                    // => <div data-server-rendered="true">Hello World</div>
                })
            } catch (error) {
                console.log(error)
            }


        }else{
            throw "no README.md!";
        }
    }
}




function _getHtmlForWebview(uiName:string, content: string, getMediaUri:Function): string{
    uiName = uiName.split('.')[0];
// And the uri we use to load this script in the webview
    const scriptUri = getMediaUri(['media', 'main.js']).with({ scheme: 'vscode-resource' });
    const src = `https://vusion.github.io/proto-ui/components/${uiName}`;
    return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">

                <!--
                Use a content security policy to only allow loading images from https or from our extension directory,
                and only allow scripts that have a specific nonce.
                -->

                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Cat Coding</title>
                <link rel="stylesheet" type="text/css" href="${getMediaUri(['media', 'out.min.css'])}">
            </head>
            <body>
                <script>
                    window.vusionSource="${src}"
                </script>
                <script src="${scriptUri}"></script>

            </body>
            </html>`;
}
