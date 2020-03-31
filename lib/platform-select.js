function platformSelect(choices) {
  const { platform } = process;
  return choices[platform] || choices.default;
}

module.exports = platformSelect;
