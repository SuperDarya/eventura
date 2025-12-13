const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

function readJSONFile(filename) {
  try {
    const filePath = path.join(dataDir, filename);
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function writeJSONFile(filename, data) {
  try {
    const filePath = path.join(dataDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    return false;
  }
}

function getNextId(data) {
  return data.length > 0 ? Math.max(...data.map(item => item.id || 0)) + 1 : 1;
}

module.exports = {
  readJSONFile,
  writeJSONFile,
  getNextId,
  dataDir
};

