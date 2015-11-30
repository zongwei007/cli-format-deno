"use strict";

//default escape code is the first code in the array
exports.escape = [
    '\u001b',
    '\u009b'
];

//a list of codes to cater to, grouped and named
exports.codes = {
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
        'intense-black': 90,
        'intense-red': 91,
        'intense-green': 92,
        'intense-yellow': 93,
        'intense-blue': 94,
        'intense-magenta': 95,
        'intense-cyan': 96,
        'intense-white': 97
    },
    blink: {
        slow: 5,
        fast: 6,
        none: 25
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
        'intense-black': 100,
        'intense-red': 101,
        'intense-green': 102,
        'intense-yellow': 103,
        'intense-blue': 104,
        'intense-magenta': 105,
        'intense-cyan': 106,
        'intense-white': 107
    },
    display: {
        conceal: 8,
        reveal: 28
    },
    emphasis: {
        italic: 3,
        fraktur: 20,
        normal: 23
    },
    font: {
        default: 10,
        '1': 11,
        '2': 12,
        '3': 13,
        '4': 14,
        '5': 15,
        '6': 16,
        '7': 17,
        '8': 18,
        '9': 19
    },
    frame: {
        framed: 51,
        encircled: 52,
        overlined: 53,
        none: 54,
        'not-overlined': 55
    },
    image: {
        negative: 7,
        positive: 27
    },
    strikeout: {
        strikeout: 9,
        none: 29
    },
    underline: {
        single: 4,
        none: 24
    },
    weight: {
        bold: 1,
        faint: 2,
        normal: 22
    }
};
