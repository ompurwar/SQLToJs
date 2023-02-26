// escapes RegExp special characters
const escapePattern = s => s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

// converts ILIKE pattern to a RegExp object
const ilikeToRegExp = pattern =>
  new RegExp(
    `^${escapePattern(pattern)}$`
      // convert ILIKE wildcards, don't match escaped
      .replace(/(?<![\\])%/g, '.*')
      .replace(/(?<![\\])_/g, '.')
      // replace ILIKE escapes
      .replace(/\\%/g, '%')
      .replace(/\\_/g, '_'),
    'i'
  );

  export {ilikeToRegExp}