describe("selectorText", function(){
    it("returns wrapped html", function(){
        var div = document.createElement("div");
        div.innerHTML = "text";
        div.setAttribute("class", "testClass");
        div.setAttribute("id", "fakeID");

        var expected = "&lt;div <span class=\"capture no_select\" title=\"click to capture attr-class property\"" +
                " data-capture=\"attr-class\">class=\"testClass\"</span> " + 
                "<span class=\"capture no_select\" title=\"click to capture attr-id property\"" +
                " data-capture=\"attr-id\">id=\"fakeID\"</span>&gt;" + 
                "<span class=\"capture no_select\" title=\"click to capture text property\"" +
                " data-capture=\"text\">text</span>&lt;/div&gt;";
        expect(selectorText(div)).toEqual(expected);
    });
});

describe("cleanOuterHTML", function(){
    it("returns elements outerHTML", function(){
        var expectedHTML = "<div>This is a test</div>",
            div = document.createElement("div");
        div.innerHTML = "This is a test";
        expect(cleanOuterHTML(div)).toEqual(expectedHTML);
    });

    it("removes query_check/collect_highlight classes", function(){
        var expectedHTML = "<div class=\"\">This is a test</div>",
            div = document.createElement("div");
        div.setAttribute("class", "query_check collect_highlight");
        div.innerHTML = "This is a test";
        expect(cleanOuterHTML(div)).toEqual(expectedHTML);
    });

    it("shortens long text with ellipsis", function(){
        var expectedHTML = "<div>1234567890123456789012345...6789012345678901234567890</div>",
            div = document.createElement("div");
        div.innerHTML = "123456789012345678901234567890123456789012345678901234567890" + 
            "12345678901234567890123456789012345678901234567890";
        expect(cleanOuterHTML(div)).toEqual(expectedHTML);
    });
});

describe("wrapProperty", function(){
    it("wraps an element property", function(){
        var property = "class=\"test\"",
            expected = "<span class=\"capture no_select\" title=\"click to capture attr-class property\"" +
                " data-capture=\"attr-class\">class=\"test\"</span>";
        expect(wrapProperty(property, "attr-class")).toEqual(expected);
    });

    it("wraps text", function(){
        var property = "test",
            expected = "<span class=\"capture no_select\" title=\"click to capture text property\"" +
                " data-capture=\"text\">test</span>";
        expect(wrapProperty(property, "text")).toEqual(expected);
    });

    it("appends before/after text", function(){
       var property = "test",
            expected = "before<span class=\"capture no_select\" title=\"click to capture text property\"" +
                " data-capture=\"text\">test</span>after";
        expect(wrapProperty(property, "text", "before", "after")).toEqual(expected); 
    });

    it("returns empty string for empty properties", function(){
        var property = "class=\"\"",
            expected = "";
        expect(wrapProperty(property, "attr-class")).toEqual(expected);
    });
});

describe("escapeRegExp", function(){
    it("returns characters escaped with backslashes", function(){
        var chars = "-[]/{}()*+?.^$|",
            expected = "\\-\\[\\]\\/\\{\\}\\(\\)\\*\\+\\?\\.\\^\\$\\|";
        expect(escapeRegExp(chars)).toEqual(expected);
    });
});

/*
describe("", function(){
    it("", function(){

    });
});
*/