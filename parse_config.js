#! /usr/bin/env node

// Import necessary packages
import fs from 'fs-extra';
import path from 'path';
import * as yaml from 'yaml';

// Define the environment variable name for the config folder
const CONFIG_FOLDER_ENV_VAR = 'ZELIJ_CONFIG_FOLDER';
const DATA_FOLDER_ENV_VAR = 'ZELIJ_DATA_FOLDER';

// Define the folder containing the YAML files and output location
// Determine the configuration folder path
const configFolderPath = process.env[CONFIG_FOLDER_ENV_VAR]
  ? path.resolve(process.cwd(), process.env[CONFIG_FOLDER_ENV_VAR])
  : path.join(process.cwd(), 'zelij_config');
const outputFilePath = path.join(process.cwd(), 'static/config/zelij_configuration.json');

// Define the source and destination paths for data files
const dataFolderPath = process.env[DATA_FOLDER_ENV_VAR]
  ? path.resolve(process.cwd(), process.env[DATA_FOLDER_ENV_VAR])
  : path.join(process.cwd(), 'zelij_data');
const staticDataFolderPath = path.join(process.cwd(), 'static/data');

// Define the high-level keys that should be merged as arrays
const mergeableKeys = ['dashboards', 'data_sources', 'data_apps']; 

// Function to read and parse YAML files recursively
async function readYAMLFiles(folderPath) {
  let allParsedConfigs = [];
  const entries = await fs.readdir(folderPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(folderPath, entry.name);
    if (entry.isDirectory()) {
      // If it's a directory, recursively call readYAMLFiles
      allParsedConfigs = allParsedConfigs.concat(await readYAMLFiles(fullPath));
    } else if (entry.isFile() && (entry.name.endsWith('.yaml') || entry.name.endsWith('.yml'))) {
      // If it's a YAML file, read and parse it
      const fileContent = await fs.readFile(fullPath, 'utf8');
      const parsedContent = yaml.parse(fileContent);
      allParsedConfigs.push(parsedContent);
    }
  }

  return allParsedConfigs;
}

// Function to merge the YAML objects, with special handling for specific keys
function mergeConfigs(configs) {
  const merged = {};

  configs.forEach(config => {
    Object.keys(config).forEach(key => {
      if (mergeableKeys.includes(key)) {
        // If the key is one of the mergeable ones, merge the arrays
        if (!merged[key]) {
          merged[key] = [];
        }
        merged[key] = [...merged[key], ...config[key]];
      } else if (merged[key] && typeof merged[key] === 'object' && typeof config[key] === 'object') {
        // If both are objects, merge them recursively
        merged[key] = { ...merged[key], ...config[key] };
      } else if (!merged[key]) {
        // Otherwise, directly set the value
        merged[key] = config[key];
      }
    });
  });

  return merged;
}

// Function to write the merged config to a JSON file
async function writeMergedConfig(config) {
  const jsonContent = JSON.stringify(config, null, 2);
  await fs.writeFile(outputFilePath, jsonContent, 'utf8');
  console.log('Merged configuration saved to:', outputFilePath);
}

// Function to recursively copy data files (with clean slate)
async function copyDataFiles() {
  try {
    // 1. Remove the existing static/data folder if it exists
    if (await fs.pathExists(staticDataFolderPath)) {
      console.log(`Removing existing data folder: ${staticDataFolderPath}`);
      await fs.remove(staticDataFolderPath);
    }

    // 2. Ensure the static/data directory exists (recreate it)
    console.log(`Creating fresh data folder: ${staticDataFolderPath}`);
    await fs.ensureDir(staticDataFolderPath);

    // 3. Copy files from zelij_data to static/data
    console.log(`Copying data from '${dataFolderPath}' to '${staticDataFolderPath}'`);
    await fs.copy(dataFolderPath, staticDataFolderPath); // No need for overwrite: true as the folder is new
    console.log(`Successfully copied data from '${dataFolderPath}' to '${staticDataFolderPath}'`);
  } catch (error) {
    console.error(`Error copying data files from '${dataFolderPath}' to '${staticDataFolderPath}':`, error);
  }
}

// Main execution
async function processZelij() {
  try {
    // Step 1: Merge YAML configurations
    console.log('Starting YAML parsing ...');
    const configs = await readYAMLFiles(configFolderPath);
    console.log('Starting YAML configuration merge...');
    const mergedConfig = mergeConfigs(configs);
    console.log('Writing to zelij_configuration.json...');
    await writeMergedConfig(mergedConfig);

    // Step 2: Copy data files
    console.log('Starting data file copy...');
    await copyDataFiles();

    console.log('Zelij processing complete. 🎉');
  } catch (error) {
    console.error('Error during Zelij processing: 💔', error);
  }
}

// Execute the main function
processZelij();