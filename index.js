#!/usr/bin/env node
const path = require('path');
const fs = require('fs').promises;
const chalk = require('chalk');
const { exec } = require('shelljs');
const inquirer = require('inquirer');
const { version } = require('./package.json');

main();

function getEnvLanguage() {
  const { env } = process;
  return env.LC_ALL || env.LC_MESSAGES || env.LANG || env.LANGUAGE;
}

function languageSelect(choices) {
  const language = getEnvLanguage();

  if (/^ko/.test(language)) {
    return choices.korean || choices.default;
  } else {
    return choices.default;
  }
}

async function printLogo() {
  let art = await fs.readFile(path.join(__dirname, 'ascii-art.txt'), 'utf8');
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

function platformSelect(choices) {
  const { platform } = process;
  return choices[platform] || choices.default;
}

function execSilent(code) {
  return new Promise((resolve, reject) => {
    exec(code, { silent: true }, (code, stdout, stderr) => {
      if (+code === 0) {
        resolve(stdout);
      } else if (stderr) {
        reject(new Error(stdout));
      }
    });
  });
}

async function main() {
  await printLogo();

  const { filePath, ignore } = await inquirer.prompt([
    {
      type: 'list',
      name: 'ignore',
      choices: [
        languageSelect({
          korean: '1 무시 항목에 추가',
          default: 'Add into the ignore list',
        }),
        languageSelect({
          korean: '0 무시 항목에서 제거',
          default: 'Remove from the ignore list',
        }),
      ],
      message: languageSelect({
        korean: '실행 유형을 선택해주세요.',
        default: 'Select',
      }),
    },
    {
      type: 'input',
      name: 'filePath',
      message: languageSelect({
        korean: '파일 경로를 입력해주세요.',
        default: 'Please enter the file path',
      }),
    },
  ]);

  const codeGetter = platformSelect({
    // macOS
    darwin(filePath, ignore) {
      return `xattr -w com.dropbox.ignored ${ignore} "${filePath}"`;
    },

    // windows
    win32(filePath, ignore) {
      return `Set-Content -Path '${filePath}'  -Stream com.dropbox.ignored -Value ${ignore}`;
    },

    // linux
    linux(filePath, ignore) {
      return `attr -s com.dropbox.ignored -V ${ignore} "${filePath}"`;
    },

    // unknown platform
    default() {
      const { platform } = process;
      console.log(`Sorry... ${platform} is not a supported platform.`);
      process.exit(0);
    },
  });

  try {
    await execSilent(codeGetter(filePath, parseInt(ignore)));
  } catch (error) {
    console.log('\n', chalk.red(error.toString()));
    return;
  }

  console.log(
    chalk.green(
      languageSelect({
        korean: '성공',
        default: 'success',
      }) + '!',
    ),
  );
}

exports.printLogo = printLogo;
exports.default = exports.main = main;
