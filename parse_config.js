#! /usr/bin/env node

// Import necessary packages
import fs from 'fs-extra';
import path from 'path';
import * as yaml from 'yaml';

// Define the environment variable name for the config folder
const CONFIG_FOLDER_ENV_VAR = 'ZELIJ_CONFIG_FOLDER';

// Define the folder containing the YAML files and output location
// Determine the configuration folder path
const configFolderPath = process.env[CONFIG_FOLDER_ENV_VAR]
  ? path.resolve(process.cwd(), process.env[CONFIG_FOLDER_ENV_VAR])
  : path.join(process.cwd(), 'zelij_config');
const outputFilePath = path.join(process.cwd(), 'static/config/zelij_configuration.json');

// Define the source and destination paths for data files
const dataFolderPath = path.join(process.cwd(), 'zelij_data');
const staticDataFolderPath = path.join(process.cwd(), 'static/data');

// Define the high-level keys that should be merged as arrays
const mergeableKeys = ['dashboards', 'data_sources', 'data_apps']; 

// Function to read and parse YAML files
async function readYAMLFiles(folderPath) {
  const files = await fs.readdir(folderPath);
  const yamlFiles = files.filter(file => file.endsWith('.yaml') || file.endsWith('.yml'));

  const parsedConfigs = [];

  for (const file of yamlFiles) {
    const filePath = path.join(folderPath, file);
    const fileContent = await fs.readFile(filePath, 'utf8');
    const parsedContent = yaml.parse(fileContent);
    parsedConfigs.push(parsedContent);
  }

  return parsedConfigs;
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
    console.log('Starting YAML configuration merge...');
    const configs = await readYAMLFiles(configFolderPath);
    const mergedConfig = mergeConfigs(configs);
    await writeMergedConfig(mergedConfig);

    // Step 2: Copy data files
    console.log('Starting data file copy...');
    await copyDataFiles();

    console.log('Zelij processing complete.');
  } catch (error) {
    console.error('Error during Zelij processing:', error);
  }
}

// Execute the main function
processZelij();