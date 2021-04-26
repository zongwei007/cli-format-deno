export type CodeId = {
  fullName: string;
  group: string;
  name: string;
};

const codeIdMap = new Map<number, CodeId>();

/**
 * Convert from one ansi code array to another, overwriting codes where applicable.
 * For example, if a code for red text has and adjustment to blue text then the red
 * text code will be replaced with the blue text code.
 * @param previous
 * @param adjustment
 */
export const adjust = function (
  previous: number[],
  adjustment: number[]
): number[] {
  return clean(previous.concat(adjustment));
};

/**
 * Take an array of codes and remove any codes that are overwritten by later codes. Also,
 * if a default code is applied when default is already set then it is not included.
 * @param codes
 */
export const clean = function (codes: number[]): number[] {
  const result = [];
  let zero = false;

  // get the initial grouping object
  const groups = codes.reduce(function (prev, code) {
    // code zero hit - reset
    if (code === 0) {
      zero = true;
      return {};
    }

    const id = getCodeId(code);

    if (
      id &&
      !(zero && id.name === "default" && !prev.hasOwnProperty(id.group))
    ) {
      prev[id.group] = code;
    }

    return prev;
  }, {} as { [key: string]: number });

  // convert from groups back into array of codes
  Object.values(groups).forEach(function (group) {
    result.push(group);
  });

  // if zero was hit then add to start
  if (zero) result.unshift(0);

  return result.length > 0 ? result : [0];
};

/**
 * Take an array of codes and remove any codes that are default codes.
 * @param codes
 */
export const clearDefaults = function (codes: number[]) {
  return codes.filter(function (code) {
    var id = getCodeId(code);
    return id !== null && id.name !== "default";
  });
};

/**
 * Get the code group and name from it's number.
 * @param code
 */
const getCodeId = function (code: number): CodeId | null {
  return codeIdMap.get(code) || null;
};

export { getCodeId as id };

//a list of codes to cater to, grouped and named
export const codes = {
  bgcolor: {
    black: 30,
    red: 31,
    green: 32,
    yellow: 33,
    blue: 34,
    magenta: 35,
    cyan: 36,
    white: 37,
    default: 39,
    "intense-black": 90,
    "intense-red": 91,
    "intense-green": 92,
    "intense-yellow": 93,
    "intense-blue": 94,
    "intense-magenta": 95,
    "intense-cyan": 96,
    "intense-white": 97,
  },
  blink: {
    slow: 5,
    fast: 6,
    default: 25, // none
  },
  color: {
    black: 40,
    red: 41,
    green: 42,
    yellow: 43,
    blue: 44,
    magenta: 45,
    cyan: 46,
    white: 47,
    default: 48,
    "intense-black": 100,
    "intense-red": 101,
    "intense-green": 102,
    "intense-yellow": 103,
    "intense-blue": 104,
    "intense-magenta": 105,
    "intense-cyan": 106,
    "intense-white": 107,
  },
  display: {
    conceal: 8,
    default: 28, // reveal
  },
  emphasis: {
    italic: 3,
    fraktur: 20,
    default: 23, // normal
  },
  font: {
    default: 10,
    "1": 11,
    "2": 12,
    "3": 13,
    "4": 14,
    "5": 15,
    "6": 16,
    "7": 17,
    "8": 18,
    "9": 19,
  },
  frame: {
    framed: 51,
    encircled: 52,
    overlined: 53,
    default: 54, // none
    "not-overlined": 55,
  },
  image: {
    negative: 7,
    default: 27, // positive
  },
  strikeout: {
    strikeout: 9,
    default: 29, // none
  },
  underline: {
    single: 4,
    default: 24, // none
  },
  weight: {
    bold: 1,
    faint: 2,
    default: 22, // none
  },
};

//ansi escape sequences
export const escape = ["\u001b", "\u009b"];

(function () {
  Object.entries(codes).forEach(([groupName, group]) => {
    Object.entries(group).forEach(([codeName, code]) => {
      codeIdMap.set(code, {
        fullName: groupName + "." + codeName,
        group: groupName,
        name: codeName,
      });
    });
  });
})();
