var assert = require("assert");
var htmlPaths = require("../lib/html-paths");
var documentMatchers = require("../lib/document-matchers");
var styleReader = require("../lib/style-reader");
var results = require("../lib/results");
var test = require("./test")(module);


var readHtmlPath = styleReader.readHtmlPath;
var readDocumentMatcher = styleReader.readDocumentMatcher;
var readStyle = styleReader.readStyle;


test('styleReader.readHtmlPath', {
    'reads empty path': function() {
        assertHtmlPath("", htmlPaths.empty);
    },
    
    'reads single element': function() {
        assertHtmlPath("p", htmlPaths.elements(["p"]));
    },
    
    'reads choice of elements': function() {
        assertHtmlPath(
            "ul|ol",
            htmlPaths.elements([
                htmlPaths.element(["ul", "ol"])
            ])
        );
    },
    
    'reads nested elements': function() {
        assertHtmlPath("ul > li", htmlPaths.elements(["ul", "li"]));
    },
    
    'reads class on element': function() {
        var expected = htmlPaths.elements([
            htmlPaths.element("p", {"class": "tip"})
        ]);
        assertHtmlPath("p.tip", expected);
    },
    
    'reads multiple classes on element': function() {
        var expected = htmlPaths.elements([
            htmlPaths.element("p", {"class": "tip help"})
        ]);
        assertHtmlPath("p.tip.help", expected);
    },
    
    'reads when element must be fresh': function() {
        var expected = htmlPaths.elements([
            htmlPaths.element("p", {}, {"fresh": true})
        ]);
        assertHtmlPath("p:fresh", expected);
    },
    
    'reads ignore element': function() {
        assertHtmlPath("!", htmlPaths.ignore);
    }
});

function assertHtmlPath(input, expected) {
    assert.deepEqual(readHtmlPath(input), results.success(expected));
}

test("styleReader.readDocumentMatcher", {
    "reads plain paragraph": function() {
        assertDocumentMatcher("p", documentMatchers.paragraph());
    },
    
    "reads paragraph with style ID": function() {
        assertDocumentMatcher(
            "p.Heading1",
            documentMatchers.paragraph({styleId: "Heading1"})
        );
    },
    
    "reads paragraph with style name": function() {
        assertDocumentMatcher(
            "p[style-name='Heading 1']",
            documentMatchers.paragraph({styleName: "Heading 1"})
        );
    },
    
    "reads p:ordered-list(1) as ordered list with index of 0": function() {
        assertDocumentMatcher(
            "p:ordered-list(1)",
            documentMatchers.paragraph({list: {isOrdered: true, levelIndex: 0}})
        );
    },
    
    "reads p:unordered-list(1) as unordered list with index of 0": function() {
        assertDocumentMatcher(
            "p:unordered-list(1)",
            documentMatchers.paragraph({list: {isOrdered: false, levelIndex: 0}})
        );
    },
    
    "reads plain run": function() {
        assertDocumentMatcher(
            "r",
            documentMatchers.run()
        );
    },
    
    "reads bold": function() {
        assertDocumentMatcher(
            "b",
            documentMatchers.bold
        );
    },
    
    "reads italic": function() {
        assertDocumentMatcher(
            "i",
            documentMatchers.italic
        );
    },
    
    "reads underline": function() {
        assertDocumentMatcher(
            "u",
            documentMatchers.underline
        );
    },
    
    "reads strikethrough": function() {
        assertDocumentMatcher(
            "strike",
            documentMatchers.strikethrough
        );
    },
    
    "reads comment-reference": function() {
        assertDocumentMatcher(
            "comment-reference",
            documentMatchers.commentReference
        );
    }
});
    
function assertDocumentMatcher(input, expected) {
    assert.deepEqual(readDocumentMatcher(input), results.success(expected));
}

test("styleReader.read", {
    "document matcher is mapped to HTML path using arrow": function() {
        assertStyleMapping(
            "p => h1",
            {
                from: documentMatchers.paragraph(),
                to: htmlPaths.elements(["h1"])
            }
        );
    },
    
    "reads style mapping with no HTML path": function() {
        assertStyleMapping(
            "r =>",
            {
                from: documentMatchers.run(),
                to: htmlPaths.empty
            }
        );
    }
});

function assertStyleMapping(input, expected) {
    assert.deepEqual(readStyle(input), results.success(expected));
}
