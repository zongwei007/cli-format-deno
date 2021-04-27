export type FormatConfig = {
  /** set to false to remove ansi formatting */
  ansi: boolean;
  /** content to add to the end of the line */
  filler: string;
  /** content to add to the start of first line */
  firstLineIndent: string;
  /** content to add to the start of all but the first line */
  hangingIndent: string;
  /** if a word is longer than the width this hard break is used to split the word */
  hardBreak: string;
  /** set to true to justify text */
  justify: boolean;
  /** the maximum number of spaces between words when justifying */
  justifyLimit: number;
  /** padding to add to the left of output */
  paddingLeft: string;
  /** padding to place between columns */
  paddingMiddle: string;
  /** padding to add to the right of output */
  paddingRight: string;
  /** true to trim end of line or a number to indicate how much to trim */
  trimEndOfLine: boolean;
  /** true to trim start of line or a number to indicate how much to trim */
  trimStartOfLine: boolean;
  /** the width before wrapping occurs */
  width: number;
};

// An array of characters to identify as soft break locations
export const breaks = [
  " ",
  "-",
  "\n",
  "\u2007", //figure space
  "\u2060", //word joiner
];

export const config: Omit<FormatConfig, "paddingMiddle"> = {
  ansi: Deno.isatty(Deno.stdout.rid),
  filler: "",
  firstLineIndent: "",
  hangingIndent: "",
  hardBreak: "-",
  justify: false,
  justifyLimit: 3,
  paddingLeft: "",
  paddingRight: "",
  trimEndOfLine: true,
  trimStartOfLine: false,
  width: Deno.consoleSize(Deno.stdout.rid).columns || 80,
};

export const columnConfig: Pick<FormatConfig, "paddingMiddle" | "width"> = {
  paddingMiddle: "   ",
  width: Deno.consoleSize(Deno.stdout.rid).columns || 80, //the total width to allot the table
};

// A map of characters with special widths
// The string-width module takes care of most of this
export const lengths: { [key: string]: number } = {
  "\u200B": 0, //zero width character
};

// A map of sequences to transform into the value sequence
// The key is a regular expression
export const transform: Record<string, string> = {
  "\r\n": "\n",
  "\t": "  ",
};

export const setDefaultConfig = (values: Partial<FormatConfig>) => {
  Object.assign(config, values);
};

export const setDefaultColumnConfig = (
  values: Partial<typeof columnConfig>
) => {
  Object.assign(columnConfig, values);
};
