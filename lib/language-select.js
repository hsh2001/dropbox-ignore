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

module.exports = languageSelect;
