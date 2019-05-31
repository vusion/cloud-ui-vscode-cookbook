import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs'

export  async function  appendFiles(abspath: string){
    await Promise.all([
        createFile(path.join(abspath, 'index.js'), 'export default {}'),
        createFile(path.join(abspath,'index.html'), '<div></div>'),
        createFile(path.join(abspath,'module.css'), '.root{}'),
    ])
}

export async function createFile(newFileName: string, content: string): Promise<string> {
    const doesFileExist: boolean = await fileExists(newFileName);

    if (!doesFileExist) {
        await appendFile(newFileName, content);
    }

    return newFileName;
}

export function appendFile(name: string, content: string){
    return new Promise((resolve, reject) => {
        fs.appendFile(name, content, (err) =>{
            if(err) reject(err);
            resolve(name)
        })
    })
}

export function isFolder(path: string) :boolean{
    return fs.statSync(path).isDirectory();
}
export function fileExists(path: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      fs.exists(path, exists => {
        resolve(exists);
      });
    });
}
