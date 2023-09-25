import * as vscode from 'vscode';
import * as fs from 'fs';
import axios from 'axios'

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('api-insights.index', async () => {
		const options: vscode.OpenDialogOptions = {
			canSelectMany: false,
			openLabel: 'Open',
			filters: {
				'JSON Files': ['json'],
				'All Files': ['*']
			}
		};

		const fileUri = await vscode.window.showOpenDialog(options);

		if (fileUri && fileUri[0]) {
			const filePath = fileUri[0].fsPath

			try {
				const fileData = fs.readFileSync(filePath)

				const response = await axios.post(
					'https://api.apiinsights.io/api/v1/schemas',
					{
						'schema': fileData
					},
					{
						headers: {
							'Content-Type': 'multipart/form-data'
						}
					}
				);

				if (response.status === 202) {
					console.log(response.data.id)
					vscode.window.showInformationMessage('Successfully sent OpenAPI spec.');

					const uri = vscode.Uri.parse(`https://apiinsights.io/reports/${response.data.id}`)

					vscode.env.openExternal(uri)
				} else {
					vscode.window.showErrorMessage('Something went wrong.')
					console.log(response.data)
				}
 			} catch (error) {
				vscode.window.showErrorMessage('Failed to send OpenAPI spec.');
				console.error(error);
			}

			context.subscriptions.push(disposable)
		}
	})
}

export function deactivate() {}