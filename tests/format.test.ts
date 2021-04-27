import { afterAll, beforeEach, describe, it } from "../deps/test_suite.ts";
import { assertEquals, equal } from "../deps/asserts.ts";
import { createRequire } from "../deps/modules.ts";

import * as config from "../src/format-config.ts";
import * as format from "../src/format.ts";

import type { SeparateFormat } from "../src/format.ts";

const require = createRequire(import.meta.url);
const chalk = require("chalk");
const colors = require("colors/safe");

describe("format", function () {
  chalk.enabled = true;
  colors.enabled = true;

  config.setDefaultConfig({ trimEndOfLine: false, width: 120 });
  config.setDefaultColumnConfig({ width: 120 });

  afterAll(function () {
    config.setDefaultConfig({ trimEndOfLine: true });
  });

  describe("#columns.lines", function () {
    describe("one column", function () {
      let lines: string[];

      beforeEach(function () {
        lines = format.columns.lines(["01234 678 012"], {
          ansi: false,
          width: 10,
        });
      });

      it("has two lines", function () {
        assertEquals(lines.length, 2);
      });

      it("first line", function () {
        assertEquals(lines[0], "01234 678 ");
      });

      it("second line", function () {
        assertEquals(lines[1], "012       ");
      });
    });

    describe("two column", function () {
      var lines: string[];
      beforeEach(function () {
        lines = format.columns.lines(["01234 678 012", "abcd fghij lmnop"], {
          ansi: false,
          width: 20,
          paddingMiddle: "",
        });
      });

      it("has two lines", function () {
        assertEquals(lines.length, 2);
      });

      it("first line", function () {
        assertEquals(lines[0], "01234 678 abcd fghij");
      });

      it("second line", function () {
        assertEquals(lines[1], "012       lmnop     ");
      });
    });

    describe("two columns, first with more lines", function () {
      var lines: string[];
      beforeEach(function () {
        lines = format.columns.lines(["01234 678 012", "abcd"], {
          ansi: false,
          width: 20,
          paddingMiddle: "",
        });
      });

      it("has two lines", function () {
        assertEquals(lines.length, 2);
      });

      it("first line", function () {
        assertEquals(lines[0], "01234 678 abcd      ");
      });

      it("second line", function () {
        assertEquals(lines[1], "012                 ");
      });
    });

    describe("two columns, second with more lines", function () {
      var lines: string[];
      beforeEach(function () {
        lines = format.columns.lines(["abcd", "01234 678 012"], {
          ansi: false,
          width: 20,
          paddingMiddle: "",
        });
      });

      it("has two lines", function () {
        assertEquals(lines.length, 2);
      });

      it("first line", function () {
        assertEquals(lines[0], "abcd      01234 678 ");
      });

      it("second line", function () {
        assertEquals(lines[1], "          012       ");
      });
    });

    describe("two columns padding middle", function () {
      var lines: string[];
      beforeEach(function () {
        lines = format.columns.lines(["01234 678 012", "abcd"], {
          ansi: false,
          width: 20,
          paddingMiddle: " | ",
        });
      });

      it("has two lines", function () {
        assertEquals(lines.length, 2);
      });

      it("first line", function () {
        assertEquals(lines[0], "01234 678 | abcd    ");
      });

      it("second line", function () {
        assertEquals(lines[1], "012       |         ");
      });
    });

    describe("two columns with new line", function () {
      var lines: string[];
      beforeEach(function () {
        lines = format.columns.lines(["abcd", "01234\n01 2345"], {
          ansi: false,
          width: 20,
          paddingMiddle: "",
        });
      });

      it("has two lines", function () {
        assertEquals(lines.length, 2);
      });

      it("first line", function () {
        assertEquals(lines[0], "abcd      01234     ");
      });

      it("second line", function () {
        assertEquals(lines[1], "          01 2345   ");
      });
    });

    describe("two columns with different configurations", function () {
      let lines: string[];

      beforeEach(function () {
        lines = format.columns.lines(
          [
            { content: "1234 678 0123", ansi: false, width: 10 },
            { content: "123456 89012 4567 123456", ansi: true, width: 20 },
          ],
          { ansi: false, paddingMiddle: "" }
        );
      });

      it("has two lines", function () {
        assertEquals(lines.length, 2);
      });

      it("first line", function () {
        assertEquals(
          lines[0],
          "1234 678  \u001b[0m123456 89012 4567 \u001b[0m  \u001b[0m"
        );
      });

      it("second line", function () {
        assertEquals(
          lines[1],
          "0123      \u001b[0m123456\u001b[0m              \u001b[0m"
        );
      });
    });

    describe("two columns, first is empty", function () {
      var lines: string[];
      beforeEach(function () {
        lines = format.columns.lines([null, "1234"], {
          ansi: false,
          paddingMiddle: "",
          width: 20,
        });
      });

      it("has one line", function () {
        assertEquals(lines.length, 1);
      });

      it("first line", function () {
        assertEquals(lines[0], "          1234      ");
      });
    });
  });

  describe("#column.wrap", function () {
    it("has two lines", function () {
      var result = format.columns.wrap(["123 567 1234", "123456 890 0123"], {
        ansi: false,
        paddingMiddle: "",
        width: 22,
      });
      assertEquals(result, "123 567    123456 890\n1234       0123      ");
    });
  });

  describe("#justify", function () {
    it("equal justification", function () {
      //           0123456789 123456              0123456789 123456789
      var input = "This is a string.";
      assertEquals(format.justify(input, 20), "This  is  a  string.");
    });

    it("inequal justification", function () {
      //           0123456789 123456              0123456789 1234567
      var input = "This is a string.";
      assertEquals(format.justify(input, 18), "This  is a string.");
    });
  });

  describe("#lines", function () {
    describe("no formatting", function () {
      var config = { filler: "", ansi: false, width: 20 };

      describe("exact line length", function () {
        var input = "0123456789 123456789 1";
        var lines = format.lines(input, config);

        it("has two lines", function () {
          assertEquals(lines.length, 2);
        });

        it("first line is full", function () {
          assertEquals(lines[0].length, 20);
        });

        it("first line", function () {
          assertEquals(lines[0], "0123456789 123456789");
        });

        it("second line", function () {
          assertEquals(lines[1], "1");
        });
      });

      describe("line ends in space", function () {
        var input = "0123456789 12345678 01";
        var lines = format.lines(input, config);

        it("has two lines", function () {
          assertEquals(lines.length, 2);
        });

        it("first line", function () {
          assertEquals(lines[0], "0123456789 12345678 ");
        });

        it("second line", function () {
          assertEquals(lines[1], "01");
        });
      });

      describe("line ends in dash", function () {
        var input = "0123456789 12345678-01";
        var lines = format.lines(input, config);

        it("has two lines", function () {
          assertEquals(lines.length, 2);
        });

        it("first line", function () {
          assertEquals(lines[0], "0123456789 12345678-");
        });

        it("second line", function () {
          assertEquals(lines[1], "01");
        });
      });

      describe("long word", function () {
        var input = "0123 56789012345678901234 6789 1234";
        var lines = format.lines(input, config);

        it("has three lines", function () {
          assertEquals(lines.length, 3);
        });

        it("first line", function () {
          assertEquals(lines[0], "0123 ");
        });

        it("second line", function () {
          assertEquals(lines[1], "56789012345678901234");
        });

        it("third line", function () {
          assertEquals(lines[2], "6789 1234");
        });
      });

      describe("too long word same line", function () {
        var input = "0123 5678901234567890123456789 1234";
        var lines = format.lines(input, config);

        it("has two lines", function () {
          assertEquals(lines.length, 2);
        });

        it("first line", function () {
          assertEquals(lines[0], "0123 56789012345678-");
        });

        it("second line", function () {
          assertEquals(lines[1], "90123456789 1234");
        });
      });

      describe("too long word next line", function () {
        var input = "012345 7890123456 8901234567890123456789 1234";
        var lines = format.lines(input, config);

        it("has three lines", function () {
          assertEquals(lines.length, 3);
        });

        it("first line", function () {
          assertEquals(lines[0], "012345 7890123456 ");
        });

        it("second line", function () {
          assertEquals(lines[1], "8901234567890123456-");
        });

        it("third line", function () {
          assertEquals(lines[2], "789 1234");
        });
      });

      describe("too long word first line indent", function () {
        var input = "2345678901234567890 23456789 1234";
        var lines = format.lines(input, {
          filler: "",
          ansi: false,
          width: 20,
          firstLineIndent: "  ",
        });

        it("has two lines", function () {
          assertEquals(lines.length, 2);
        });

        it("first line", function () {
          //01234
          assertEquals(lines[0], "  23456789012345678-");
        });

        it("second line", function () {
          assertEquals(lines[1], "90 23456789 1234");
        });
      });

      describe("too long word hanging indent", function () {
        var input = "0123 567890123456789012345 789 1234";
        var lines = format.lines(input, {
          filler: "",
          ansi: false,
          width: 20,
          hangingIndent: "  ",
        });

        it("has two lines", function () {
          assertEquals(lines.length, 2);
        });

        it("first line", function () {
          assertEquals(lines[0], "0123 56789012345678-");
        });

        it("second line", function () {
          assertEquals(lines[1], "  9012345 789 1234");
        });
      });

      describe("too long word for 3 lines", function () {
        var input = "0123 56789012345678901234567890123456789012345 6789 1234";
        var lines = format.lines(input, { filler: "", ansi: false, width: 20 });

        it("has three lines", function () {
          assertEquals(lines.length, 3);
        });

        it("first line", function () {
          assertEquals(lines[0], "0123 56789012345678-");
        });

        it("second line", function () {
          assertEquals(lines[1], "9012345678901234567-");
        });

        it("third line", function () {
          assertEquals(lines[2], "89012345 6789 1234");
        });
      });

      describe("justification across lines", function () {
        //0123456789 123456789
        var input =
          "0123 56 89 abcdef " +
          "012 45678 0abc efg " +
          "01234567890abcdefghi " +
          "01234 67";
        var lines = format.lines(input, {
          filler: "",
          ansi: false,
          width: 20,
          justify: true,
        });

        it("has 3 lines", function () {
          assertEquals(lines.length, 4);
        });

        it("first line", function () {
          assertEquals(lines[0], "0123  56  89  abcdef");
        });

        it("second line", function () {
          assertEquals(lines[1], "012  45678  0abc efg");
        });

        it("third line", function () {
          //01234567890123456789
          assertEquals(lines[2], "01234567890abcdefghi");
        });

        it("fourth line", function () {
          assertEquals(lines[3], "01234 67");
        });
      });

      describe("justification with new lines", function () {
        //0123456789 123456789
        var input =
          "0123 56 89 abcdef\n" +
          "012 45678 0abc efg " +
          "01234567890abcdefghi " +
          "01234 67";
        var lines = format.lines(input, {
          filler: "",
          ansi: false,
          width: 20,
          justify: true,
        });

        it("has 3 lines", function () {
          assertEquals(lines.length, 4);
        });

        it("first line", function () {
          assertEquals(lines[0], "0123 56 89 abcdef");
        });

        it("second line", function () {
          assertEquals(lines[1], "012  45678  0abc efg");
        });

        it("third line", function () {
          //01234567890123456789
          assertEquals(lines[2], "01234567890abcdefghi");
        });

        it("fourth line", function () {
          assertEquals(lines[3], "01234 67");
        });
      });
    });

    describe("formatting", function () {
      var config = { filler: "", ansi: true, width: 20 };

      describe("ends at line length", function () {
        var input = "0123456789 " + chalk.bold(123456789) + " 1";
        var lines = format.lines(input, config);
        var expected: Array<Record<string, number[]>> = [
          { "0": [0], "11": [1], "19": [22], "20": [0] },
          { "0": [0], "1": [0] },
        ];
        multiLineFormatValidator(2, lines, expected);
      });

      describe("ends before line length", function () {
        var input = "0123456789 " + chalk.bold("12345") + "6789 1";
        var lines = format.lines(input, config);
        var expected: Array<Record<string, number[]>> = [
          { "0": [0], "11": [1], "16": [22], "20": [0] },
          { "0": [0], "1": [0] },
        ];
        multiLineFormatValidator(2, lines, expected);
      });

      describe("traverses multiple lines", function () {
        var input = "0123456789 " + chalk.bold("1234567 012345") + " 789";
        var lines = format.lines(input, config);
        var expected: Array<Record<string, number[]>> = [
          { "0": [0], "11": [1], "19": [0] },
          { "0": [0, 1], "6": [22], "10": [0] },
        ];
        multiLineFormatValidator(2, lines, expected);
      });

      describe("traverses new line", function () {
        var input = "012 " + chalk.bold("45\n0123") + " 567";
        var lines = format.lines(input, config);
        var expected: Array<Record<string, number[]>> = [
          { "0": [0], "4": [1], "6": [0] },
          { "0": [0, 1], "4": [22], "8": [0] },
        ];
        multiLineFormatValidator(2, lines, expected);
      });

      describe("new format per line", function () {
        var input =
          "01\n" +
          chalk.bold("23\n") +
          chalk.italic("45") +
          "\n" +
          chalk.underline("67");
        var lines = format.lines(input, config);
        var expected = [
          { "0": [0], "2": [0] },
          { "0": [0, 1], "2": [0] },
          { "0": [0, 3], "2": [0] },
          { "0": [0, 4], "2": [0] },
        ];
        multiLineFormatValidator(4, lines, expected);
      });
    });

    describe("filler", function () {
      var config = { filler: "abc", ansi: false, width: 10 };
      var input = "012345 789 012345 01234567";
      var lines = format.lines(input, config);

      it("has three lines", function () {
        assertEquals(lines.length, 3);
      });

      it("first line", function () {
        assertEquals(lines[0], "012345 789");
      });

      it("second line", function () {
        assertEquals(lines[1], "012345 abc");
      });

      it("third line", function () {
        assertEquals(lines[2], "01234567ab");
      });
    });

    describe("paddingLeft", function () {
      var config = { filler: " ", ansi: false, width: 10, paddingLeft: ">" };
      var input = "12345 789 123";
      var lines = format.lines(input, config);

      it("has two lines", function () {
        assertEquals(lines.length, 2);
      });

      it("first line has padding", function () {
        assertEquals(lines[0], ">12345 789");
      });

      it("second line has padding", function () {
        assertEquals(lines[1], ">123      ");
      });
    });

    describe("paddingRight", function () {
      var config = { filler: " ", ansi: false, width: 10, paddingRight: "<" };
      var input = "12345 789 123";
      var lines = format.lines(input, config);

      it("has two lines", function () {
        assertEquals(lines.length, 2);
      });

      it("first line has padding", function () {
        assertEquals(lines[0], "12345 789<");
      });

      it("second line has padding", function () {
        assertEquals(lines[1], "123      <");
      });
    });

    describe("first line indent", function () {
      var config = {
        firstLineIndent: "  ",
        filler: " ",
        ansi: false,
        width: 10,
      };
      var input = "2345 789 012345";
      var lines = format.lines(input, config);

      it("has two lines", function () {
        assertEquals(lines.length, 2);
      });

      it("first line", function () {
        assertEquals(lines[0], "  2345 789");
      });

      it("second line", function () {
        assertEquals(lines[1], "012345    ");
      });
    });

    describe("hanging indent", function () {
      var config = { hangingIndent: "  ", filler: " ", ansi: false, width: 10 };
      var input = "012345 789 2345";
      var lines = format.lines(input, config);

      it("has two lines", function () {
        assertEquals(lines.length, 2);
      });

      it("first line", function () {
        assertEquals(lines[0], "012345 789");
      });

      it("second line", function () {
        assertEquals(lines[1], "  2345    ");
      });
    });

    describe("new line", function () {
      var config = { ansi: false, width: 10 };
      var input = "0123\n012 4567";
      var lines = format.lines(input, config);

      it("has two lines", function () {
        assertEquals(lines.length, 2);
      });

      it("first line", function () {
        assertEquals(lines[0], "0123");
      });

      it("second line", function () {
        assertEquals(lines[1], "012 4567");
      });
    });
  });

  /* describe("#separate", function () {
    config.setDefaultConfig({ ansi: true });

    describe("chalk none-bold-boldItalic-italic-none", function () {
      var str =
        "01" +
        chalk.bold("23") +
        chalk.bold.italic("45") +
        chalk.italic("67") +
        "89";
      var sep = format.separate(str);

      it("has string without formatting", function () {
        assertEquals(sep.value, "0123456789");
      });

      it("has 4 format changes", function () {
        assertEquals(sep.format.length, 4);
      });

      it("has first format change at index 2", function () {
        assertEquals(sep.format[0].index, 2);
      });

      it("has first format change to [1]", function () {
        equal(sep.format[0].codes, [1]);
      });

      it("has second format change at index 4", function () {
        assertEquals(sep.format[1].index, 4);
      });

      it("has second format change to [1,3]", function () {
        equal(sep.format[1].codes, [1, 3]);
      });

      it("has third format change at index 6", function () {
        assertEquals(sep.format[2].index, 6);
      });

      it("has third format change to [22,3]", function () {
        equal(sep.format[2].codes, [22, 3]);
      });

      it("has forth format change at index 8", function () {
        assertEquals(sep.format[3].index, 8);
      });

      it("has forth format change to [23]", function () {
        equal(sep.format[3].codes, [23]);
      });
    });

    describe("colors none-bold-boldItalic-italic-none", function () {
      var str =
        "01" +
        colors.bold("23") +
        colors.bold.italic("45") +
        colors.italic("67") +
        "89";
      var sep = format.separate(str);

      it("has string without formatting", function () {
        assertEquals(sep.value, "0123456789");
      });

      it("has 4 format changes", function () {
        assertEquals(sep.format.length, 4);
      });

      it("has first format change at index 2", function () {
        assertEquals(sep.format[0].index, 2);
      });

      it("has first format change to [1]", function () {
        equal(sep.format[0].codes, [1]);
      });

      it("has second format change at index 4", function () {
        assertEquals(sep.format[1].index, 4);
      });

      it("has second format change to [1,3]", function () {
        equal(sep.format[1].codes, [1, 3]);
      });

      it("has third format change at index 6", function () {
        assertEquals(sep.format[2].index, 6);
      });

      it("has third format change to [22,3]", function () {
        equal(sep.format[2].codes, [22, 3]);
      });

      it("has forth format change at index 8", function () {
        assertEquals(sep.format[3].index, 8);
      });

      it("has forth format change to [23]", function () {
        equal(sep.format[3].codes, [23]);
      });
    });
  }); */

  describe("#transform", function () {
    it("uses default transforms", function () {
      assertEquals(format.transform("Hello\r\nBob"), "Hello\nBob");
    });

    it("accepts additional transforms", function () {
      assertEquals(format.transform("abc", { b: "B" }), "aBc");
    });
  });

  describe("#trim", function () {
    describe("without ansi", function () {
      it("trims start", function () {
        assertEquals(format.trim("   abc   ", true, false), "abc   ");
      });

      it("trims end", function () {
        assertEquals(format.trim("   abc   ", false, true), "   abc");
      });

      it("trims some of start", function () {
        assertEquals(format.trim("   abc   ", 2, false), " abc   ");
      });

      it("trims some of end", function () {
        assertEquals(format.trim("   abc   ", false, 2), "   abc ");
      });
    });

    describe("with ansi", function () {
      it("trims start", function () {
        assertEquals(
          format.trim(chalk.blue("   abc   "), true, false),
          "\u001b[94mabc   \u001b[39m"
        );
      });

      it("trims end", function () {
        assertEquals(
          format.trim(chalk.blue("   abc   "), false, true),
          "\u001b[94m   abc\u001b[39m"
        );
      });

      it("trims some of start", function () {
        assertEquals(
          format.trim(chalk.blue("   abc   "), 2, false),
          "\u001b[94m abc   \u001b[39m"
        );
      });

      it("trims some of end", function () {
        assertEquals(
          format.trim(chalk.blue("   abc   "), false, 2),
          "\u001b[94m   abc \u001b[39m"
        );
      });
    });
  });

  describe("#width", function () {
    it("double width character", function () {
      assertEquals(format.width("古"), 2);
    });

    it("zero width character", function () {
      assertEquals(format.width("\u200B"), 0);
    });

    it("single width character", function () {
      assertEquals(format.width("x"), 1);
    });

    it("ansi has zero width", function () {
      var input = chalk.bold("x");
      assertEquals(format.width(input), 1);
    });
  });

  describe("#words", function () {
    it("spaces", function () {
      var result = format.words("This is a test");
      equal(result, ["This ", "is ", "a ", "test"]);
    });

    it("dash", function () {
      var result = format.words("crazy-good");
      equal(result, ["crazy-", "good"]);
    });

    it("new line", function () {
      var result = format.words("new\nline");
      equal(result, ["new\n", "line"]);
    });
  });

  describe("#wrap", function () {
    var input = "123 56 890 2345";
    var result = format.wrap(input, { ansi: false, width: 10 });

    it("has two lines", function () {
      assertEquals(result.split("\n").length, 2);
    });

    it("has expected content", function () {
      assertEquals(result, "123 56 \n890 2345");
    });
  });
});

function formatValidator(
  formats: SeparateFormat[],
  expectedMap: Record<string, number[]>
) {
  var keys = Object.keys(expectedMap);

  it("has " + keys.length + " format sets", function () {
    assertEquals(formats.length, keys.length);
  });

  keys.forEach(function (key, index) {
    var value = expectedMap[key];

    describe("format " + index, function () {
      it("has index " + key, function () {
        assertEquals(formats[index].index, parseInt(key));
      });

      it("has code [" + value.join(",") + "]", function () {
        equal(formats[index].codes, value);
      });
    });
  });
}

function multiLineFormatValidator(
  expectedLines: number,
  lines: string[],
  expected: Array<Record<string, number[]>>
) {
  var formats = lines.map((line) => format.separate(line).format);

  it("has " + expectedLines + " lines", function () {
    assertEquals(lines.length, expectedLines);
  });

  formats.forEach(function (format, lineNo) {
    describe("line " + (lineNo + 1), function () {
      formatValidator(format, expected[lineNo]);
    });
  });
}
