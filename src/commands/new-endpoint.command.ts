import * as _ from "lodash";
import * as changeCase from "change-case";
import * as mkdirp from "mkdirp";

import {
  InputBoxOptions,
  OpenDialogOptions,
  Uri,
  window
} from "vscode";
import { existsSync, lstatSync, writeFile } from "fs";
import {
  getDefaultEndpointTemplate,
  getDefaultControllerTemplate,
  getDefaultMiddlewareTemplate,
} from "../templates";

export const newEndpoint = async (uri: Uri) => {
  const endpointName = await promptForEndpointName();
  if (_.isNil(endpointName) || endpointName.trim() === "") {
    window.showErrorMessage("The endpoint name must not be empty");
    return;
  }

  let targetDirectory;
  if (_.isNil(_.get(uri, "fsPath")) || !lstatSync(uri.fsPath).isDirectory()) {
    targetDirectory = await promptForTargetDirectory();
    if (_.isNil(targetDirectory)) {
      window.showErrorMessage("Please select a valid directory");
      return;
    }
  } else {
    targetDirectory = uri.fsPath;
  }

  try {
    await generateEndpointCode(endpointName, targetDirectory);
    const pascalCaseEndpointName = changeCase.pascalCase(endpointName);
    window.showInformationMessage(
      `Successfully Generated ${pascalCaseEndpointName} Endpoint`
    );
  } catch (error) {
    window.showErrorMessage(
      `Error:
        ${error instanceof Error ? error.message : JSON.stringify(error)}`
    );
  }
};

function promptForEndpointName(): Thenable<string | undefined> {
  const endpointNamePromptOptions: InputBoxOptions = {
    prompt: "Endpoint name",
    placeHolder: "Endpoint",
  };
  return window.showInputBox(endpointNamePromptOptions);
}

async function promptForTargetDirectory(): Promise<string | undefined> {
  const options: OpenDialogOptions = {
    canSelectMany: false,
    openLabel: "Select a folder to create the endpoint in",
    canSelectFolders: true,
  };

  return window.showOpenDialog(options).then((uri) => {
    if (_.isNil(uri) || _.isEmpty(uri)) {
      return undefined;
    }
    return uri[0].fsPath;
  });
}

async function generateEndpointCode(
  endpointName: string,
  targetDirectory: string
) {
  const snakeCaseEndpointName = changeCase.snakeCase(endpointName).toLowerCase();
  const endpointDirectoryPath = `${targetDirectory}/${snakeCaseEndpointName}`;

  if (!existsSync(endpointDirectoryPath)) {
    await createDirectory(endpointDirectoryPath);
  }

  await Promise.all([
    createEndpointMiddlewareTemplate(endpointName, endpointDirectoryPath),
    createEndpointControllerTemplate(endpointName, endpointDirectoryPath),
    createEndpointTemplate(endpointName, endpointDirectoryPath),
  ]);
}

function createDirectory(targetDirectory: string): Promise<void> {
  return new Promise((resolve, reject) => {
    mkdirp(targetDirectory, (error) => {
      if (error) {
        return reject(error);
      }
      resolve();
    });
  });
}

function createEndpointMiddlewareTemplate(
  endpointName: string,
  targetDirectory: string
) {
  const snakeCaseEndpointName = changeCase.snakeCase(endpointName).toLowerCase();
  const targetPath = `${targetDirectory}/${snakeCaseEndpointName}_middleware.dart`;
  if (existsSync(targetPath)) {
    throw Error(`${snakeCaseEndpointName}_middleware.dart already exists`);
  }
  return new Promise<void>(async (resolve, reject) => {
    writeFile(
      targetPath,
      getDefaultMiddlewareTemplate(endpointName),
      "utf8",
      (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      }
    );
  });
}

function createEndpointControllerTemplate(
  endpointName: string,
  targetDirectory: string
) {
  const snakeCaseEndpointName = changeCase.snakeCase(endpointName).toLowerCase();
  const targetPath = `${targetDirectory}/${snakeCaseEndpointName}_controller.dart`;
  if (existsSync(targetPath)) {
    throw Error(`${snakeCaseEndpointName}_controller.dart already exists`);
  }
  return new Promise<void>(async (resolve, reject) => {
    writeFile(
      targetPath,
      getDefaultControllerTemplate(endpointName),
      "utf8",
      (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      }
    );
  });
}

function createEndpointTemplate(
  endpointName: string,
  targetDirectory: string
) {
  const snakeCaseEndpointName = changeCase.snakeCase(endpointName).toLowerCase();
  const targetPath = `${targetDirectory}/${snakeCaseEndpointName}.dart`;
  if (existsSync(targetPath)) {
    throw Error(`${snakeCaseEndpointName}.dart already exists`);
  }
  return new Promise<void>(async (resolve, reject) => {
    writeFile(targetPath, getDefaultEndpointTemplate(endpointName), "utf8", (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}
