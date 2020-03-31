#!/usr/bin/env node
const path = require('path');
const fs = require('fs').promises;
const del = require('del');
const chalk = require('chalk');
const { exec } = require('shelljs');
const inquirer = require('inquirer');
const { version } = require('./package.json');

const { PWD } = process.env;

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
  let filePath, ignore, npmReinstallNeed;
  await printLogo();

  if (PWD) {
    const nodeModulesPath = path.join(PWD, 'node_modules');

    try {
      const stats = await fs.stat(nodeModulesPath);
      if (stats.isDirectory()) {
        const { targetToNodeModules } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'targetToNodeModules',
            message: languageSelect({
              korean:
                'node_modules 폴더가 발견되었습니다. 이 폴더를 무시 목록에 추가하시겠습니까? (npm 모듈이 삭제 후 재설치됩니다.)',
              default:
                'node_modules folder found. Do you want to add this folder to the ignore list? (npm modules will be deleted and reinstalled.)',
            }),
          },
        ]);

        if (targetToNodeModules) {
          filePath = nodeModulesPath;
          ignore = true;
          npmReinstallNeed = true;
          console.log(
            languageSelect({
              korean: 'node_modules 폴더 삭제중...',
              default: 'Deleting node_modules folder...',
            }),
          );
          await del(nodeModulesPath);
        }
      }
      // eslint-disable-next-line no-empty
    } catch {}
  }

  if (!filePath) {
    ({ filePath, ignore } = await inquirer.prompt([
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
    ]));
  }

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
    await execSilent(codeGetter(filePath, parseInt(+!!ignore)));
  } catch (error) {
    console.log('\n', chalk.red(error.toString()));
    return;
  }

  if (npmReinstallNeed) {
    console.log(
      languageSelect({
        korean: 'npm 모듈을 다시 설치하는 중...',
        default: 'Reinstalling npm module...',
      }),
    );
    await execSilent('npm i');
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
