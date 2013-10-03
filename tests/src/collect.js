/*
given an element, return html for selector text with 
"capture"able parts wrapped
*/
function selectorText(element) {
    var curr, attr, replace_regexp,
        // match 2+ spaces, newlines, and tabs
        singleSpaceRegexp = /(\s{2,}|[\n\t]+)/g,
        html = cleanOuterHTML(element).replace(singleSpaceRegexp, ''),
        // match all opening html tags along with their attributes
        tags = html.match(/<[^\/].+?>/g),
        text_val = $(element).text().replace(singleSpaceRegexp, '').replace('&','&amp;'),
        properties = [];
    // find tag attributes
    if ( tags ) {
        /*
        @tags is an array of strings of opening html tags
        eg. <a href="#">
        returns an array of the unique attributes
        */
        var property_regex = /[a-zA-Z\-_]+=('.*?'|".*?")/g,
            property_check = {},
            tagProps = tags.join('').match(property_regex);
        if ( tagProps ) {
        // add unique attributes to properties array
            for ( var p=0, tagLen=tagProps.length; p<tagLen; p++ ) {
                curr = tagProps[p];
                if ( !property_check[curr] ) { 
                    properties.push(tagProps[p]);
                    property_check[curr] = true;
                }
                
            }
        }
    }

    html = html.replace(/</g,'&lt;').replace(/>/g,'&gt;');
    // replace properties with capture spans
    for ( var i=0, prop_len=properties.length; i<prop_len; i++ ) {
        curr = properties[i];
        attr = curr.slice(0, curr.indexOf('='));
        replace_regexp = new RegExp(escapeRegExp(curr), 'g');
        // don't include on___ properties
        if ( attr.indexOf('on') === 0 ) {
            html = html.replace(replace_regexp, '');    
        } else {
            html = html.replace(replace_regexp, wrapProperty(curr, 'attr-' + attr));    
        }
    }
    
    // create capture spans with 'text' targets on all text
    if ( text_val !== '' ) {
        if ( text_val.length > 100 ){
            text_val = text_val.slice(0, 25) + "..." + text_val.slice(-25);
        }
        // strip preceding/trailing spaces
        text_val = text_val.replace(/</g,'&lt;').replace(/>/g,'&gt;');
        text_val = text_val.replace(/(^\s*|[\n\t]+|\s*$)/g, '');
        var regexp_string = '(?:&gt;\\s*)' + escapeRegExp(text_val) + '(?:\\s*&lt;)',
            text_replace_regexp = new RegExp(regexp_string, 'g'),
            replace_string = wrapProperty(text_val, 'text', '&gt;', '&lt;');
        html = html.replace(text_replace_regexp, replace_string);
    }
    return html;
}

/*
returns a string representing the html for the @ele element
and its text. Child elements of @ele will have their tags stripped, 
returning only their text. 
If that text is > 100 characters, concatenates for ease of reading
*/
function cleanOuterHTML(ele){
    if (!ele) {
        return '';
    }
    var copy = ele.cloneNode(true),
        $copy = $(copy),
        // strip unnecessary spaces spit out by some template englines
        text = $copy.text().replace(/(\s{2,}|[\n\t]+)/g,' ');
    $copy.removeClass('query_check').removeClass('collect_highlight');
    // 
    if ( text.length > 100 ){
        text = text.slice(0, 25) + "..." + text.slice(-25);
    }
    $copy.html(text);
    return copy.outerHTML;
}

/*
wrap an attribute or the text of an html string 
(used in #selector_text div)
*/
function wrapProperty(ele, val, before, after){
    // don't include empty properties
    if ( ele.indexOf('=""') !== -1 ) {
        return '';
    }
    return (before || '') + '<span class="capture no_select" ' + 
        'title="click to capture ' + val + ' property" data-capture="' +
        val + '">' + ele + '</span>' + (after || '');
}

// escape a string for a new RegExp call
function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

jQuery.fn.swapClasses = function(oldClass, newClass){
    return this.each(function(){
        $(this)
            .removeClass(oldClass)
            .addClass(newClass);
    })
}

/*
saves @rule to localStorage.rules array
*/
function saveRule(group, rule){
    // should this break if group isn't passed?
    if ( arguments.length !== 2) {
        return false;
    }
    var rules = getRules(group),
        active = $('.active_selector');
    if ( active.length ) {
        var activeName = active.eq(0).text();
        if ( activeName !== rule.name ){
            delete rules[activeName];
        }
    }
    
    rules[rule.name] = rule;
    setRules(group, rules);
    return true;
}

// group argument optional, if not included return all rules
function getRules(group){
    if ( localStorage.rules === undefined ) {
        localStorage.rules = "{}";
    }
    var rules = JSON.parse(localStorage.rules);
    if ( group === undefined ) {
        return rules
    } else {
        // create group if it doesn't exist
        if ( rules[group] === undefined ) {
            rules[group] = {};
            localStorage.rules = JSON.stringify(rules);
        }
        return rules[group];    
    }
}

// only used by other localStorage calls
function setRules(group, obj){
    var rules = getRules();
    rules[group] = obj;
    localStorage.rules = JSON.stringify(rules);
}

function deleteRule(group, name){
    if ( arguments.length !== 2) {
        return false;
    }
    var rules = getRules(group),
        returnVal = true;
    if ( rules[name] ) {
        $(rules[name].selector).removeClass('saved_preview');
        delete rules[name];
    } else {
        returnVal = false;
    }
    setRules(group, rules);
    return returnVal;
}

function clearRules(group){
    if ( group === undefined ) {
        localStorage.rules = "{}";
    } else {
        var currGroups = JSON.parse(localStorage.rules);
        delete currGroups[group];
        localStorage.rules = JSON.stringify(currGroups);
    }    
}