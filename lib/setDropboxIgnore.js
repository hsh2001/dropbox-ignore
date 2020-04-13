const chalk = require('chalk');
const languageSelect = require('./language-select');
const platformSelect = require('./platform-select');
const execSilent = require('./exec-silent');

async function setDropboxIgnore({ filePath, ignore, silent = false }) {
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
      if (!silent) {
        console.log(`Sorry... ${platform} is not a supported platform.`);
      }
      process.exit(0);
    },
  });

  try {
    await execSilent(codeGetter(filePath, parseInt(+!!ignore)));

    if (!silent) {
      console.log(
        chalk.green(
          languageSelect({
            korean: '무시 목록에 추가 성공',
            default: 'Add to ignore list success',
          }) + '!',
        ),
      );
    }

    return true;
  } catch (error) {
    console.log('\n', chalk.red(error.toString()));
    return false;
  }
}

exports.setDropboxIgnore = setDropboxIgnore;
