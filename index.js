#!/usr/bin/env node

const { setDropboxIgnore } = require('./lib/setDropboxIgnore');

const path = require('path');
const fs = require('fs').promises;
const del = require('del');
const inquirer = require('inquirer');
const { version } = require('./package.json');
const languageSelect = require('./lib/language-select');
const printLogo = require('./lib/print-logo');
const execSilent = require('./lib/exec-silent');

const { PWD } = process.env;

main();

async function main() {
  let filePath, ignore, npmReinstallNeed;
  await printLogo(version);

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
          await fs.mkdir(nodeModulesPath);
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

  await setDropboxIgnore({ filePath, ignore });

  if (npmReinstallNeed) {
    console.log(
      languageSelect({
        korean: 'npm 모듈을 다시 설치하는 중...',
        default: 'Reinstalling npm module...',
      }),
    );
    await execSilent('npm i');
  }
}

exports.default = exports.main = main;
exports.setDropboxIgnore = setDropboxIgnore;
