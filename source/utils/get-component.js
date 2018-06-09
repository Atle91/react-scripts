/* eslint-env node */
/* eslint-disable no-console */
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const prompt = require('./prompt');

function isFullPath(inputPath) {
  const slugs = inputPath.split(path.sep);
  const dirnameSlugs = __dirname.split(path.sep);

  return slugs && slugs[1] === dirnameSlugs[1];
}

function isPath(inputPath) {
  return inputPath.indexOf(path.sep) !== -1;
}

// This function tries to find a react component from a full path, a path relative to 'componentsPath' or the current working directory
module.exports = function getComponent(
  { pathOrName, componentsPath },
  callback
) {
  prompt(
    {
      pathOrName: {
        text: 'Name of or path to component',
        value: pathOrName
      }
    },
    ({ pathOrName }) => {
      parse({ pathOrName, componentsPath, callback });
    }
  );
};

function resolve({ callback, componentName, filePath, folderPath }) {
  if (!fs.existsSync(folderPath) || !fs.existsSync(filePath)) {
    console.log(
      `👻  ${chalk.redBright("Couldn't find component")} ${componentName}.`
    );
    process.exit(1);
  }

  callback({ componentName, filePath, folderPath });
}

function parse({ pathOrName, componentsPath, callback }) {
  const slugs = pathOrName.split(path.sep);
  const lastSlug = slugs.slice(-1)[0];
  const hasFileExtension = pathOrName.indexOf('.jsx') !== -1;

  // Handle full path
  if (isFullPath(pathOrName)) {
    resolve({
      callback,
      componentName: lastSlug.replace(/.jsx$/, ''),
      filePath: pathOrName,
      folderPath: pathOrName.slice(0, pathOrName.lastIndexOf(path.sep))
    });
    return;
  }

  // Handle path relative to 'componentsPath'
  if (isPath(pathOrName)) {
    const fullPath = path.join(componentsPath, pathOrName);
    const componentName = lastSlug.replace(/.jsx$/, '');

    resolve({
      callback,
      componentName,
      filePath: hasFileExtension
        ? fullPath
        : path.join(fullPath, `${componentName}.jsx`),
      folderPath: hasFileExtension
        ? fullPath.slice(0, fullPath.lastIndexOf(path.sep))
        : fullPath
    });
    return;
  }

  // Handle file in current working directory
  if (hasFileExtension) {
    resolve({
      callback,
      componentName: lastSlug.replace(/.jsx$/, ''),
      filePath: path.join(process.cwd(), lastSlug),
      folderPath: process.cwd()
    });
    return;
  }

  // Handle component directly descending 'componentsPath'
  resolve({
    callback,
    componentName: lastSlug,
    filePath: path.join(componentsPath, lastSlug, `${lastSlug}.jsx`),
    folderPath: path.join(componentsPath, lastSlug)
  });
}