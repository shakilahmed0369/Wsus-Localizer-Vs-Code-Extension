// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const cheerio = require("cheerio");
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

function extractTextFromCode(codeContent) {
  const content = codeContent;
  let $ = cheerio.load(content);

  $("*").each((index, element) => {
    const text = $(element)
      .contents()
      .map(function () {
        if (this.type === "text") {
          const text = $(this).text().trim();
          if (text && !/[@{}$,()]/.test(text)) {
            // Replace the text directly
            $(this).replaceWith(`{{__("${text}")}}`);
          }
        }
      });
  });

  // Return the modified content as a string
  return trimmer($.html());
}

function trimmer(content) {
  var trimmedContent = content;

  if (content.indexOf("<!DOCTYPE html>") === -1) {
    const startIndex = content.indexOf("<body>") + 6;
    const endIndex = content.indexOf("</body>");
    var trimmedContent = trimmedContent.substring(startIndex, endIndex);
  }
  var trimmedContent = trimmedContent.replace(/-=""/g, "-");
  var trimmedContent = trimmedContent.replace(/&gt;/g, ">");

  return trimmedContent;
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "localizer" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "wsus.localizer",
    function () {
      // The code you place here will be executed every time your command is executed

      // Display a message box to the user
      // vscode.window.showInformationMessage('Hello World from localizer!');

      // Get the active text editor
      const editor = vscode.window.activeTextEditor;

      if (editor) {
        // Get the document and its content
        const document = editor.document;
        const content = document.getText();

        const replacedContents = extractTextFromCode(content);
        
        // Replace content
        const edit = new vscode.WorkspaceEdit();
        edit.replace(
          document.uri,
          new vscode.Range(
            document.positionAt(0), // Start of the content
            document.positionAt(content.length) // End of the content
          ),
          replacedContents
        );

        vscode.workspace.applyEdit(edit).then(() => {
          vscode.window.showInformationMessage(
            "Content Replaced Successfully!"
          );
        });
      } else {
        vscode.window.showErrorMessage("No active text editor found.");
      }
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
