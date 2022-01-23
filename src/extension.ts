// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as glob from 'glob';
import * as fs from 'fs';
import * as fxp from 'fast-xml-parser';


const fidPatten = /_fid_\w+\./g;
const pathLevel = 1;

let classFieldObj = {
    dyn: new Map(),
    domComp: new Map(),
    domAct: new Map(),
    dim: new Map()
};
let classNameList: string[] = [];
let searchPathSet = new Set();

function parseClass(searchPath: string) {
    const files = glob.sync(path.join(searchPath, '**', "*_mim.xml"));
    for (let f of files) {
        const text = fs.readFileSync(f, {encoding: 'utf-8'});
        const parser = new fxp.XMLParser({ignoreAttributes: false});
        const xml = parser.parse(text);
    }
}

function getFields(fid: string, searchPath: string) {

    if (!searchPathSet.has(searchPath)) {
        parseClass(searchPath);
    }

    const className = fid.substring(5, fid.length-1);

    if (classFieldObj.dyn.has(className)) {
        return classFieldObj.dyn.get(className);
    } else if (classFieldObj.domComp.has(className)) {
        return classFieldObj.domComp.get(className);
    } else if (classFieldObj.domAct.has(className)) {
        return classFieldObj.domAct.get(className);
    } else if (classFieldObj.dim.has(className)) {
        return classFieldObj.dim.get(className);
    }

    return undefined;
}


export function activate(context: vscode.ExtensionContext) {
    
    console.log('Congratulations, your extension "luaquick" is now active!');

    let disposable = vscode.commands.registerCommand('luaquick.helloWorld', () => {
        vscode.window.showInformationMessage('Hello World from LuaQuick!');
    });

    context.subscriptions.push(disposable);

    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(
        'lua',
        {
                provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {

                    const linePrefix = document.lineAt(position).text.substring(0, position.character);
                    console.log(`linePrefix: ${linePrefix}`);
                    const file: string = document.fileName;
                    console.log(file);
                    const sp = file.split(path.sep);
                    const searchPath = path.join(...sp.slice(0, -pathLevel));
                    console.log(searchPath);

                    const found = linePrefix.match(fidPatten);

                    if (found === null || found.length === 0) {
                        return undefined;
                    }


                    const fid = found[0];
                    const fields = getFields(fid, searchPath);
                    if (fields === undefined) {
                        return undefined;
                    }

                    return fields.map((f: string) => {
                        return new vscode.CompletionItem(f, vscode.CompletionItemKind.Field); 
                    });
                    
                },
            },
            '.'
    ));
}

// this method is called when your extension is deactivated
export function deactivate() {}
