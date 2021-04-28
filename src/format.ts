import * as ansi from "./ansi.ts";
import * as formatConfig from "./format-config.ts";
import stringWidth from "../deps/string-width.ts";

import type { FormatConfig } from "./format-config.ts";

export type Column = Partial<ColumnFormatConfig>;

export type ColumnFormatConfig = Omit<FormatConfig, "width"> & {
  content: string | number | boolean;
  width?: FormatConfig["width"];
};

export type SeparateFormat = {
  index: number;
  codes: number[];
};
/**
 * Take a string of text and extend it to the width specified by adding spaces beside existing spaces.
 * @param string The string to justify
 * @param width The width to stretch the string to
 */
export function justify(string: string, width: number): string {
  const array = string.split(" ");
  const remaining = width - getStringWidth(string);
  const length = array.length - 1;
  const modulus = remaining % length;
  const share = Math.floor(remaining / length);

  if (remaining < 0) return string;

  return array.reduce(function (str, word, index) {
    const addCount = share + (index < modulus ? 1 : 0);
    if (index === length) return str + word;
    return str + word + " " + getFiller(addCount, " ");
  }, "");
}

/**
 * Take a string, set a width to wrap out, and get back an array of strings.
 * @param str The string to produced wrapped lines for.
 * @param configuration Options to overwrite the default configuration.
 */
export function toLines(
  str: string,
  configuration: Partial<FormatConfig> = {}
): string[] {
  const config = Object.assign({}, formatConfig.config, configuration);
  const data = separateString(str);
  const firstLineIndentWidth = getStringWidth(config.firstLineIndent);
  const formats = data.format;
  const hangingIndentWidth = getStringWidth(config.hangingIndent);
  const lastLineIndexes: { [key: number]: boolean } = {};
  const newLineRx = /\n$/;
  const words = getStringWords(data.value);
  const paddingLeftWidth = getStringWidth(config.paddingLeft);
  const paddingRightWidth = getStringWidth(config.paddingRight);
  const width = config.width - paddingLeftWidth - paddingRightWidth;

  let indentWidth = firstLineIndentWidth;
  let index = 0;
  let line = "";
  let lines = [];
  let lineWidth = 0;
  let newLine;
  let word;

  function ansiEncode(codes: number[]) {
    return config.ansi ? ansi.escape[0] + "[" + codes.join(";") + "m" : "";
  }

  function adjustFormatIndexes(offset: number) {
    index += offset;
    if (offset !== 0) {
      formats.forEach(function (format) {
        if (format.index >= index) format.index += offset;
      });
    }
  }

  // separate words into lines
  while ((word = words.shift())) {
    const availableWidth = width - lineWidth - indentWidth;
    const trimmedWord = word.replace(/ $/, "");
    const trimmedWordWidth = getStringWidth(trimmedWord);
    const wordWidth = getStringWidth(word);

    index += word.length;
    newLine = newLineRx.test(word);

    // word fits on line
    if (wordWidth <= availableWidth) {
      line += word;
      lineWidth += wordWidth;

      // trimmed word fits on the line
    } else if (trimmedWordWidth <= availableWidth) {
      adjustFormatIndexes(-1);

      lines.push(line + trimmedWord);
      line = "";
      lineWidth = 0;
      indentWidth = hangingIndentWidth;

      // word is too long for any line
    } else if (trimmedWordWidth > width - indentWidth) {
      let o;
      // add to the end of the current line
      if (availableWidth > 3) {
        o = maximizeLargeWord(word, config.hardBreak, availableWidth);
        lines.push(line + o.start);

        // put on a new line
      } else {
        if (line.length > 0) lines.push(line);
        o = maximizeLargeWord(word, config.hardBreak, width - indentWidth);
        lines.push(o.start);
      }
      words.unshift(o.remaining);

      line = "";
      lineWidth = 0;
      indentWidth = hangingIndentWidth;

      adjustFormatIndexes(config.hardBreak.length);
      newLine = false;

      // send word to next line
    } else {
      lines.push(line);
      indentWidth = hangingIndentWidth;
      if (trimmedWordWidth === width - indentWidth) {
        lines.push(trimmedWord);
        line = "";
        lineWidth = 0;
      } else {
        line = word;
        lineWidth = wordWidth;
      }
    }

    // if there is a new line character at the end of the word then start a new line
    if (newLine) {
      lastLineIndexes[lines.length] = true;
      lines.push(line);
      line = "";
      lineWidth = 0;
      indentWidth = hangingIndentWidth;
    }
  }
  if (line.length > 0) lines.push(line);
  lastLineIndexes[lines.length - 1] = true;

  let activeFormat = [0];
  // add formatting to the lines
  if (config.ansi) {
    index = 0;
    lines = lines.map(function (line) {
      return line
        .split("")
        .map(function (ch: string, colIndex: number) {
          var codes: number[] = [];
          var result = "";

          // determine what codes to add before the character
          if (formats[0] && index === formats[0].index) {
            activeFormat = formats.shift()!.codes;
            codes = activeFormat;
          }
          if (colIndex === 0) {
            codes = activeFormat;
            codes.unshift(0);
          }

          // add codes before and after the character
          if (codes.length > 0) result += ansiEncode(ansi.clean(codes));
          result += ch;
          if (colIndex === line.length - 1) result += ansiEncode([0]);

          index++;
          return result;
        })
        .join("");
    });
  }

  // add padding and indents to the lines
  lines = lines.map(function (line, index) {
    const firstLine = index === 0;
    const indent = firstLine ? config.firstLineIndent : config.hangingIndent;
    const indentWidth = firstLine ? firstLineIndentWidth : hangingIndentWidth;
    const isLastLine = lastLineIndexes[index];

    // remove all new line characters as they were accounted for during line creation
    line = line.replace(/\n/g, "");

    // trim the line and justify
    line = trim(
      line,
      config.trimStartOfLine,
      config.trimEndOfLine || config.justify
    );
    if (!isLastLine && config.justify)
      line = justify(line, width - indentWidth);

    // add padding and indents
    let prefix = config.paddingLeft + indent;
    let suffix =
      getFiller(width - getStringWidth(line) - indentWidth, config.filler) +
      config.paddingRight;

    // add encoding resets
    if (prefix.length > 0) prefix = ansiEncode([0]) + prefix;
    if (suffix.length > 0) suffix += ansiEncode([0]);

    // return the result
    return prefix + line + suffix;
  });

  return lines;
}

/**
 * Take a string and separate out the ansi characters from the content.
 * @param str
 */
function separateString(
  str: string
): { format: SeparateFormat[]; value: string } {
  const format = [];
  // build the RegExp for finding ansi escape sequences
  const rx = new RegExp("[" + ansi.escape.join("") + "]\\[((?:\\d;?)+)+m");

  let activeCodes: number[] = [];
  let prevIndex = -1;
  let result = "";

  // begin separating codes from content
  while (str.length > 0) {
    const match = rx.exec(str);

    if (match) {
      const additionalCodes = match[1].split(";").map((v) => parseInt(v));

      let o;

      result += str.substr(0, match.index);
      str = str.substr(match.index + match[0].length);

      if (prevIndex === result.length) {
        o = format[format.length - 1];
        o.codes = ansi.adjust(o.codes, additionalCodes);
      } else {
        const prevCodes = ansi.clearDefaults(activeCodes);
        o = {
          index: result.length,
          codes: ansi.adjust(prevCodes, additionalCodes),
        };
        format.push(o);
      }

      activeCodes = o.codes;
      prevIndex = result.length;
    } else {
      result += str;
      str = "";
    }
  }

  return {
    format,
    value: result,
  };
}

/**
 * Transform a string into a new string.
 * @param str
 * @param configuration A map of strings to replace (as properties) with values (as values).
 */
export function transform(
  str: string,
  configuration: Record<string, string> = {}
): string {
  const config = Object.assign({}, formatConfig.transform, configuration);

  Object.entries(config).forEach(([key, value]) => {
    str = str.replace(new RegExp(key.replace(/\\/g, "\\\\")), value);
  });

  return str;
}

/**
 * Trim spaces off the start or end of a string, but keep ansi formatting information.
 * @param str The string to trim.
 * @param start True to trim the start, a number to indicate how much to trim.
 * @param end True to trim the end, a number to indicate how much to trim.
 */
export function trim(
  str: string,
  start: boolean | number,
  end: boolean | number
): string {
  const template = "([" + ansi.escape.join("") + "]\\[(?:(?:\\d;?)+)+m)?";

  //trim the start
  let rx = new RegExp("^" + template + " ");

  if (typeof start == "number" && start <= 0) start = false;

  while (rx.test(str) && start) {
    str = str.replace(rx, "$1");
    if (typeof start === "number") {
      start--;
      if (start <= 0) start = false;
    }
  }

  //trim the end
  rx = new RegExp(" " + template + "$");

  if (typeof end == "number" && end <= 0) end = false;

  while (rx.test(str) && end) {
    str = str.replace(rx, "$1");
    if (typeof end === "number") {
      end--;
      if (end <= 0) end = false;
    }
  }

  return str;
}

/**
 * Pass in a string and get back an array of words.
 * @param content
 * @param keepAnsi
 */
export function getStringWords(content: string, keepAnsi?: boolean): string[] {
  const indexes = [0];
  const words = [];

  let count = 0;
  let word = "";

  // remove ansi formatting
  if (!keepAnsi) content = separateString(content).value;

  for (let i = 0; i < content.length; i++) {
    const ch = content.charAt(i);

    count++;
    word += ch;
    if (formatConfig.breaks.indexOf(ch) !== -1) {
      words.push(word);
      indexes.push(i + 1);
      word = "";
      count = 0;
    }
  }

  if (count > 0) words.push(word);

  return words;
}

/**
 * Get the width of a string (not it's length). Some characters
 * take more or less than one space.
 * @param str
 */
function getStringWidth(str: string): number {
  let width = stringWidth(str);

  for (let i = 0; i < str.length; i++) {
    const ch = str.charAt(i);
    if (ch in formatConfig.lengths) {
      width += -1 + formatConfig.lengths[ch];
    }
  }

  return width;
}

/**
 * Wrap a string.
 * @param str
 * @param configuration
 */
export function wrap(
  str: string,
  configuration: Partial<FormatConfig> = {}
): string {
  const config = Object.assign({}, formatConfig.config, configuration);
  config.width--; // decrement width since we're adding a \n to the end of each line
  return toLines(str, config).join("\n");
}

class Columns {
  lines(
    columns: Array<string | Column | null>,
    configuration: Partial<FormatConfig> = {}
  ) {
    const columnsWithoutAssignedWidth: number[] = [];
    const config = Object.assign({}, formatConfig.columnConfig, configuration);
    const middlePaddingWidth = getStringWidth(config.paddingMiddle);
    const result = [];

    // build the default column configuration
    const defaultColumnConfig: Omit<
      ColumnFormatConfig,
      "content"
    > = Object.assign({}, formatConfig.config, config);
    delete defaultColumnConfig.width;

    // turn all columns into objects
    const formatColumns: ColumnFormatConfig[] = columns.map(function (column) {
      let mix: Column;

      if (typeof column === "string") {
        mix = { content: column };
      } else if (!column || typeof column !== "object") {
        mix = {};
      } else {
        mix = column;
      }

      const result = Object.assign({ content: "" }, defaultColumnConfig, mix);
      if (!result.filler) result.filler = " ";

      return result;
    });

    // determine the amount of unclaimed width
    const unclaimedWidth = formatColumns.reduce(function (
      value,
      config,
      index
    ) {
      if (typeof config.width === "number") return value - config.width;
      columnsWithoutAssignedWidth.push(index);
      return value;
    },
    config.width - middlePaddingWidth * (columns.length - 1));

    // distribute unclaimed width
    if (columnsWithoutAssignedWidth.length > 0) {
      const widthPerColumn = Math.floor(
        unclaimedWidth / columnsWithoutAssignedWidth.length
      );
      const widthPerColumnModulus =
        unclaimedWidth % columnsWithoutAssignedWidth.length;
      columnsWithoutAssignedWidth.forEach(function (index, i) {
        const config = formatColumns[index];

        config.width = widthPerColumn + (i < widthPerColumnModulus ? 1 : 0);
      });
    }

    // get lines for individual columns
    const columnsLines = formatColumns.map(function (config) {
      return toLines(String(config.content), config);
    });

    // determine the number of lines
    const totalLines = columnsLines.reduce(function (p, c) {
      return p > c.length ? p : c.length;
    }, 0);

    // make all column lines have the same number of lines
    columnsLines.forEach((lines, colIndex) => {
      const diff = totalLines - lines.length;
      for (let i = 0; i < diff; i++) {
        const line = toLines("\u200B", formatColumns[colIndex])[0].replace(
          /\u200B/,
          ""
        );
        lines.push(line);
      }
    });

    // put together the result
    for (let i = 0; i < totalLines; i++) {
      const line: string[] = [];
      columnsLines.forEach(function (lines) {
        line.push(lines[i]);
      });
      result.push(line.join(config.paddingMiddle));
    }

    return result;
  }
  wrap(
    columns: Array<string | Column | null>,
    configuration: Partial<FormatConfig> = {}
  ) {
    const config = Object.assign({}, formatConfig.columnConfig, configuration);

    config.width--;

    return this.lines(columns, config).join("\n");
  }
}

function getFiller(count: number, filler?: string) {
  let result = "";

  if (count < 0) count = 0;

  if (filler && typeof filler === "string" && getStringWidth(filler) > 0) {
    while (getStringWidth(result) < count) {
      result += filler;
    }
    while (getStringWidth(result) > count) {
      result = result.substr(0, result.length - 1);
    }
  }

  return result;
}

/**
 * If a word is too large for a line then find out how much will
 * fit on one line and return the result.
 * @param word
 * @param hardBreakStr
 * @param maxWidth
 */
function maximizeLargeWord(
  word: string,
  hardBreakStr: string,
  maxWidth: number
) {
  let availableWidth = maxWidth - getStringWidth(hardBreakStr);
  let i;

  for (i = 0; i < word.length; i++) {
    const ch = word.charAt(i);
    const chWidth = getStringWidth(ch);
    if (availableWidth >= chWidth) {
      availableWidth -= chWidth;
    } else {
      break;
    }
  }

  return {
    start: word.substr(0, i) + hardBreakStr,
    remaining: word.substr(i),
  };
}

export const columns = new Columns();

export {
  getStringWidth as width,
  getStringWords as words,
  toLines as lines,
  separateString as separate,
};
