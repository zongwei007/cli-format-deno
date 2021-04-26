import { describe, it } from "../deps/test_suite.ts";
import { assert, assertEquals, equal } from "../deps/asserts.ts";

import * as ansi from "../src/ansi.ts";

describe("ansi", function () {
  describe("#adjust", function () {
    it("adjusts background color", function () {
      equal(ansi.adjust([30], [31, 32]), [32]);
    });

    it("adjusts multiple", function () {
      var adj = ansi.adjust([30, 5, 44], [48, 39]);
      adj.sort(function (a, b) {
        return a > b ? 1 : -1;
      });
      equal(adj, [5, 39, 48]);
    });

    it("is reset by zero from previous", function () {
      equal(ansi.adjust([30, 0, 44], [36]), [0, 44, 36]);
    });

    it("is reset by zero from adjustment", function () {
      equal(ansi.adjust([30, 44], [0, 36]), [0, 36]);
    });
  });

  describe("#clean", function () {
    it("removes duplicates", function () {
      equal(ansi.clean([5, 5, 5, 5]), [5]);
    });

    it("manages overlapping styles", function () {
      equal(ansi.clean([32, 95, 37]), [37]);
    });

    it("is reset by zero", function () {
      equal(ansi.clean([30, 45, 0, 1]), [0, 1]);
    });

    it("can reset", function () {
      equal(ansi.clean([30, 45, 0]), [0]);
    });

    it("does not apply default over rest", function () {
      equal(ansi.clean([0, 22, 23, 29]), [0]);
    });
  });

  describe("#clearDefaults", function () {
    it("removes defaults", function () {
      equal(ansi.clearDefaults([30, 39, 54, 4]), [30, 4]);
    });
  });

  describe("#codes", function () {
    it("is an object map", function () {
      assert(typeof ansi.codes === "object");
    });

    it("defines bgcolor group", function () {
      assert(typeof ansi.codes.bgcolor === "object");
    });

    it("defines blink group", function () {
      assert(typeof ansi.codes.blink === "object");
    });

    it("defines color group", function () {
      assert(typeof ansi.codes.color === "object");
    });

    it("defines display group", function () {
      assert(typeof ansi.codes.display === "object");
    });

    it("defines emphasis group", function () {
      assert(typeof ansi.codes.emphasis === "object");
    });

    it("defines font group", function () {
      assert(typeof ansi.codes.font === "object");
    });

    it("defines frame group", function () {
      assert(typeof ansi.codes.frame === "object");
    });

    it("defines image group", function () {
      assert(typeof ansi.codes.bgcolor === "object");
    });

    it("defines strikeout group", function () {
      assert(typeof ansi.codes.strikeout === "object");
    });

    it("defines underline group", function () {
      assert(typeof ansi.codes.underline === "object");
    });

    it("defines weight group", function () {
      assert(typeof ansi.codes.weight === "object");
    });

    it("has unique codes", function () {
      var codes: number[] = [];
      var unique = true;
      Object.values(ansi.codes).forEach(function (group) {
        Object.values(group).forEach(function (value) {
          if (codes.indexOf(value) !== -1) unique = false;
          codes.push(value);
        });
      });
      assertEquals(unique, true);
    });
  });

  describe("#escape", function () {
    it("is an array of strings", function () {
      var nonStrings = ansi.escape.filter((v) => typeof v !== "string");
      assertEquals(nonStrings.length, 0);
    });
  });

  describe("#id", function () {
    it("gets background color", function () {
      assertEquals(ansi.id(32)!.fullName, "bgcolor.green");
    });

    it("gets blink", function () {
      assertEquals(ansi.id(6)!.fullName, "blink.fast");
    });

    it("gets color", function () {
      assertEquals(ansi.id(101)!.fullName, "color.intense-red");
    });

    it("gets display", function () {
      assertEquals(ansi.id(8)!.fullName, "display.conceal");
    });

    it("gets emphasis", function () {
      assertEquals(ansi.id(3)!.fullName, "emphasis.italic");
    });

    it("gets font", function () {
      assertEquals(ansi.id(14)!.fullName, "font.4");
    });

    it("gets frame", function () {
      assertEquals(ansi.id(53)!.fullName, "frame.overlined");
    });

    it("gets image", function () {
      assertEquals(ansi.id(7)!.fullName, "image.negative");
    });

    it("gets strikeout", function () {
      assertEquals(ansi.id(29)!.fullName, "strikeout.default");
    });

    it("gets underline", function () {
      assertEquals(ansi.id(4)!.fullName, "underline.single");
    });

    it("gets weight", function () {
      assertEquals(ansi.id(1)!.fullName, "weight.bold");
    });
  });
});
