const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');
const languageSelect = require('./language-select');

async function printLogo(version) {
  let art = await fs.readFile(path.join(__dirname, '../ascii-art.txt'), 'utf8');
  const tabSize = 4;
  const artWidth = art.split('\n')[0].length + tabSize * 2;
  const emptyLine = ' '.repeat(artWidth);
  const tab = ' '.repeat(tabSize);

  art = [...art.split('\n').map((s) => tab + s + tab), emptyLine].join('\n');

  console.log(chalk.blueBright.bgWhite(art), '\n');
  console.log(
    `${tab}${languageSelect({
      korean: '버전',
      default: 'version',
    })}: ${version}`,
    '\n',
  );
}

module.exports = printLogo;
