describe("selectorText and related functions", function(){
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
});


describe("jQuery.fn.swapClasses", function(){
    it("removes oldClass, adds newClass to element", function(){
        var ele = $('<div class="old"></div>');
        ele.swapClasses('old','new');
        expect(ele.hasClass('old')).toBe(false);
        expect(ele.hasClass('new')).toBe(true);
    });

    it("handles multiple elements", function(){
        var eles = $('<div class="old"></div><div class="old"></div>');
        eles.swapClasses('old','new');
        expect($(eles[0]).hasClass('new')).toBe(true);
        expect($(eles[1]).hasClass('new')).toBe(true);
    });
});

describe("localStorage related functions", function(){
    describe("getRules", function(){
        beforeEach(function(){
            // clear out the localStorage between tests
            delete localStorage
            var testRules = {
                "first":{"foo":{"name":"foo"}},
                "second":{}
            };
            localStorage.rules = JSON.stringify(testRules);
        });

        it("creates rule object if it doesn't exist", function(){
            delete localStorage.rules;
            var ignored = getRules();
            expect(localStorage.rules).toEqual("{}");
        });

        it("returns all rule groups if no argument is provided", function(){
            var rules = getRules(),
                testRules = {
                "first":{"foo":{"name":"foo"}},
                "second":{}
            };
            expect(rules).toEqual(testRules);
        });

        it("returns only group argument's rules when provided", function(){
            var rules = getRules("first"),
                expected = {"foo":{"name":"foo"}};
            expect(rules).toEqual(expected);
        });

        it("creates and returns empty object for group if it doesn't exist", function(){
            // third doesn't exist before call
            expect(getRules().third).toBeUndefined();
            // returns empty object
            expect(getRules("third")).toEqual({});
            // and sets localStorage
            expect(JSON.parse(localStorage.rules).third).toEqual({});
        });
    });

    describe("saveRule", function(){
        beforeEach(function(){
            // clear out the localStorage between tests
            delete localStorage
            var testRules = {
                "first":{"foo":{"name":"foo", "selector":"h1"}},
                "second":{}
            };
            localStorage.rules = JSON.stringify(testRules);
        });

        it("returns false when no group is provided", function(){
            expect(saveRule({"name":"fakeRule"})).toBe(false);
        });

        it("adds new rule to group", function(){
            var newRule = {"name":"new"},
                saved = saveRule("first", newRule),
                firstRules = {"foo":{"name":"foo", "selector":"h1"}, "new":{"name":"new"}};
            expect(saved).toBe(true);
            expect(getRules("first")).toEqual(firstRules);
        });

        it("overrides existing rules", function(){
            var newRule = {"name":"foo", "selector":"h2"},
                firstRules = {"foo":{"name":"foo", "selector":"h2"}};
            saveRule("first", newRule);
            expect(getRules("first")).toEqual(firstRules);
        });

        it("replaces saved rule when name is changed", function(){
            var newRule = {"name":"bar", "selector":"h1"},
                ele = document.createElement('span');
            ele.setAttribute('class', 'active_selector');
            ele.innerHTML = "foo";
            document.body.appendChild(ele);
            saveRule("first", newRule);
            expect(getRules("first")).toEqual({"bar":{"name":"bar", "selector":"h1"}});
            document.body.removeChild(ele);
        });
    });

    describe("deleteRule", function(){
        beforeEach(function(){
            // clear out the localStorage between tests
            delete localStorage
            var testRules = {
                "first":{"foo":{"name":"foo", "selector":"h1"}},
                "second":{}
            };
            localStorage.rules = JSON.stringify(testRules);
        });

        it("returns when group no group is provided", function(){
            expect(deleteRule({"name":"foo"})).toBe(false);
        });

        it("deletes the rule, returns true", function(){
            expect(getRules("first")).toEqual({"foo":{"name":"foo", "selector":"h1"}});
            var deleted = deleteRule("first", "foo");
            expect(getRules("first")).toEqual({});
        });

        it("returns false if rule doesn't exist", function(){
            expect(deleteRule("second", "foo")).toEqual(false);
        });
    });

    describe("clearRules", function(){
        beforeEach(function(){
            // clear out the localStorage between tests
            delete localStorage
            var testRules = {
                "first":{"foo":{"name":"foo", "selector":"h1"}},
                "second":{}
            };
            localStorage.rules = JSON.stringify(testRules);
        });

        it("clears rules from group argument", function(){
            clearRules("first");
            expect(getRules()).toEqual({"second":{}});
        });

        it("clears all rules when no group argument is provided", function(){
            clearRules();
            expect(getRules()).toEqual({});
        });
    });

});


/*
describe("", function(){
    it("", function(){

    });
});
*/