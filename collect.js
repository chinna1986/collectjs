(function(){
"use strict";
var makeCollect = function($){
	/***************
	COLLECT OBJECT
	***************/
	var Collect = {
		highlight_css: "border:1px solid blue !important;",
		check_css: "background: yellow !important;border: 1px solid yellow !important;",
		elements: "body *:not(.no_select)"
	};

	Collect.setup = function(args){
		if ( arguments.length !== 0 ) {
			this.highlight_css = args.highlight_css || this.highlight_css;
			this.check_css = args.check_css || this.check_css;
			this.elements = args.elements || this.elements;
		}
		addInterface();
		addOptions();
		addCSS();
		this.events.on();
		if ( !localStorage.rules ) {
			localStorage.rules = "[]";
		}
	};

	Collect.events = (function(){
		var event_obj = {
				on: function(){
					$(Collect.elements).on({
						mouseenter: select,
						mouseleave: deselect,
						click: querySelector
					});						
				},
				off: function(){
					$(Collect.elements).off({
						mouseenter: select,
						mouseleave: deselect,
						click: querySelector
					});
				}
			};

		function select(event){
			event.stopPropagation();
			$(this).addClass('collect_highlight');
		}

		function deselect(event){
			event.stopPropagation();
			$(this).removeClass('collect_highlight');
		}

		/*
		when an element is clicked, setup interface data using clicked element
		*/
		function querySelector(event){
			event.stopPropagation();
			event.preventDefault();
			if ( this === null ) {
				return;
			}
			if ( !$('.active_selector').length ){
				clearInterface();
			}
			elementInterface(this);
			
		}

		return event_obj;
	})();

	Collect.load = function(json_url){
		$.ajax({
			dataType: "jsonp",
			url: json_url,
			success: function(data){
				// loads a json object, array of desired properties to collect
				var selectors = "",
					curr;
				if ( data.names) {
					for ( var i=0, len=data.names.length; i < len; i++) {
						curr = data.names[i];
						selectors += '<span class="collect_group no_select">' + 
							'<span class="desired_selector no_select' +
							' data-selector="' + (curr.selector || '') + '"' +
							' data-capture="' + (curr.capture || '') + '">' +
							curr.name +	'</span>' +
							'<span class="deltog no_select">X</span></span>';
					}
					$('#desired_selectors').html(selectors);
				}
			}
		});
	};

	/***************
	END COLLECT OBJECT
	***************/

	/********************
	PRIVATE FUNCTIONS
	********************/

	/*
	create a style element for the collect interface and insert it into the head
	*/
	function addCSS() {
		var s = $('<style type="text/css" rel="stylesheet" id="collect-style">'),
			css_string = ".collect_highlight{" + Collect.highlight_css + "}" +
			".query_check, .query_check * {" + Collect.check_css + "}" + "#collect_interface{position: fixed;left: 25%;width: 50%;min-height: 220px;max-height: 300px;padding: 5px 20px;background: #fff;z-index: 10000;overflow-y: scroll;}#collect_interface *, #options_interface *{color: #222;font-family: sans-serif;font-size: 12px;}#collect_interface *, #options_interface *{text-align: left;}#collect_interface.attach_top{top: 0;border-width: 0 2px 2px;border-style: solid;border-color: #444;}#collect_interface.attach_bottom{bottom: 0;border-width: 2px 2px 0;border-style: solid;border-color: #444;}#collect_interface h2{font-size: 1.25em;font-weight: bold;}#collect_interface p{font-size: 1em;}#collect_interface p, #collect_interface h2{float: none;display: block;margin: 2px 0;}#control_buttons{position: absolute;top:0;right:0;}#form_inputs {margin: 15px 0;width: 60%;display: inline-block;}#form_buttons {display: inline-block;width: 40%;}#form_buttons .button_group:first-child{border-bottom: 1px solid #aaa;}#form_buttons .button_group{display: block;padding: 5px 0;}.button_group button{margin-bottom:5px;}#control_buttons button{padding: 2px 5px;margin: 0;border: 1px solid #444;border-right: 0;text-align: center;box-shadow: none;min-width: 0;border-radius: 0;}.attach_top #control_buttons button{border-top: 0;}#collect_interface button {line-height: 1em;height: 2em;float: none;clear: none;cursor: pointer;background: #efefef;font-size: 12px;font-weight: normal;padding: 0 5px;border: 1px outset #ccc;text-transform: none;}#collect_interface.attach_bottom  #control_buttons button{border-top: 0;}#selector_parts{line-height: 2em;}#selector_form input{width: 80%;border: 1px solid #777;clear: none;float: none;}#collect_interface .toggleable{cursor: pointer;}#collect_interface .toggleable:hover{color: #FF0000;}#collect_interface .capture{border: 1px solid #777;background: #ddd;padding: 2px;cursor: pointer;}#collect_interface .selector_group{white-space: nowrap;border: 1px solid #777;background: #ddd;border-right: 0;padding: 2px 0 2px 2px;position: relative;}#collect_interface #selector_form label{display: inline-block;width: 75px;}#collect_interface .off{opacity: 0.4;}#collect_interface .group_options{background:#efefef;color: #777;padding: 2px;border-width: 1px 1px 1px 0;border-style: solid;border-color: #777;margin-left: 3px;cursor: pointer;position: relative;}#collect_interface .group_dropdown{position: absolute;color: #222;display: none;z-index: 10003;background: #fff;top: 19px;right: 0;width: 80px;border: 1px solid #777;}#collect_interface .group_dropdown p{margin: 0;text-align: right;}#collect_interface .group_dropdown p:hover{background: #666;color: #efefef;}#collect_interface .group_options:hover .group_dropdown{display: block;}#collect_interface #selector_text *{line-height: 2em;}#collect_selectors{margin-top: 10px;}.collect_group{margin-right: 5px;}#saved_selectors, #desired_selectors{float: left;}.saved_selector, .desired_selector{padding: 2px 5px;border: 1px solid #777;cursor: pointer;}.collect_group .deltog{cursor: pointer;border-width: 1px 1px 1px 0;border-style: solid;border-color: #777;background: #efefef;padding: 2px;}.saved_selector.active_selector, .desired_selector.active_selector{border-color: #000;border-width: 2px;font-weight: bold;}.saved_selector{background: #B0E69E;}.desired_selector{background: #E69E9E;}#options_interface{display: none;position: fixed;width: 50%;background: #fff;border: 2px solid #444;top: 25%;left: 25%;padding: 10px;z-index: 10001;}#options_background {top: 0;left: 0;width: 100%;height: 100%;position: fixed;opacity: 0.25;background: black;display: none;}.collect_highlight{border: 1px solid blue !important;}  tr.collect_highlight{ display: table; }.query_check, .query_check *{ background: rgba(255,215,0,0.25) !important; border: 1px solid yellow; }.query_check .query_check{background: rgba(255,215,0,0.75) !important; }.saved_preview, .saved_preview *{background: rgba(255,0,0,0.25) !important; }";
		s.text(css_string);
		$('head').append(s);
	}
	
	/*
	create the collect interface, add no_select class to its elements so the interface
	doesn't interfere with itself, and add event listeners to the interface
	*/
	function addInterface() {
		var interface_html = "<div class=\"attach_bottom\" id=\"collect_interface\"><section id=\"selector_results\"><h2 >Selector</h2><p id=\"selector_parts\"></p><p id=\"selector_count\"></p><p id=\"selector_text\"></p><form id=\"selector_form\"><div id=\"collect_error\"></div><div id=\"form_inputs\"><p><label for=\"selector_name\">Name:</label><input name=\"name\" id=\"selector_name\" val=\"\" /></p><p><label for=\"selector_string\">Selector:</label><input name=\"selector\" id=\"selector_string\" val=\"\" /></p><p><label for=\"selector_capture\">Capture:</label><input name=\"capture\" id=\"selector_capture\" val=\"\" /></p></div><div id=\"form_buttons\"><div class=\"button_group\"><button id=\"collect_save\">Save</button><button id=\"collect_preview\">Preview Rule</button><button id=\"collect_clear_form\">Clear Form</button></div><div class=\"button_group\"><button id=\"collect_load\">Load Saved Rules</button><button id=\"collect_clear\">Clear Saved Rules</button><button id=\"collect_preview_saved\">Preview Saved Rules</button></div></div></form></section><div id=\"collect_selectors\"><section id=\"desired_selectors\"></section><section id=\"saved_selectors\"></section></div><div id=\"control_buttons\"><button id=\"open_options\">Options</button><button id=\"move_position\">Move to Top</button><button id=\"off_button\">Off</button><button id=\"close_selector\">Close</button></div></div>";
		$(interface_html).appendTo('body');
		$('#collect_interface, #collect_interface *').addClass('no_select');
		addInterfaceEvents();
	}

	/* event listeners associated with elements inside of the collect_interface	*/
	function addInterfaceEvents(){
		var events_on = true;
		// turn off events for highlighting/selecting page elements
		$('#off_button').click(function(event){
			event.stopPropagation();
			var _this = $(this);
			if ( events_on ) {
				Collect.events.off();
				_this.text('On');
				clearClass('query_check');
				clearClass('collect_highlight');
				clearClass('saved_preview');
			} else {
				Collect.events.on();
				_this.text('Off');
			}
			events_on = !events_on;
		});

		// close the collect interface
		$('#close_selector').click(function(event){
			event.stopPropagation();
			Collect.events.off();
			clearClass('query_check');
			clearClass('collect_highlight');
			clearClass('saved_preview');
			$('#collect_interface, #options_interface, #collect-style, #options_background').remove();
		});

		// toggle interface between top and bottom of screen
		$('#move_position').click(function(event){
			event.stopPropagation();
			var collect_interface = $('#collect_interface');
			if ( collect_interface.hasClass('attach_top') ) {
				collect_interface
					.removeClass('attach_top')
					.addClass('attach_bottom');
				$(this).text('Move to Top');
			} else {
				collect_interface
					.removeClass('attach_bottom')
					.addClass('attach_top');
				$(this).text('Move to Bottom');
			}
		});

		// select which attribute (or text) to capture desired data from query selected elements
		$('#selector_text').on('click', '.capture', function(){
			var _this = $(this);
			$('#selector_capture').val( _this.data('capture') );
		});

		// create an object for the current query selector/capture data
		$('#collect_save').click(function(event){
			event.preventDefault();
			var inputs = $('#selector_form input'),
				selector_object = {},
				active = $('.active_selector').eq(0),
				missing = [];
				
			for ( var p=0, len=inputs.length; p<len; p++ ) {
				var curr = inputs[p],
					name = curr.getAttribute('name') || 'noname',
					value = curr.value;

				if ( value === '' ) {
					missing.push(name);
				} else {
					selector_object[name] = value;
				}
			}
			if ( missing.length !== 0 ){
				$('#collect_error').html('missing attribute(s): ' + missing.join(', '));
				return;
			}
			// active isn't undefined if you're editing an already saved selector
			if ( active.length ){
				saveRule(selector_object, parseInt(active.data('index'), 10));

				// modify name, selector, and capture but not index
				active
					.data('selector', selector_object.selector)
					.data('capture', selector_object.capture)
					.text(selector_object.name)
					.removeClass('active_selector');
				// move to saved_selectors
				if ( active.parents('#desired_selectors').length ) {
					active
						.removeClass('desired_selector')
						.addClass('saved_selector')
						.parents('.collect_group')
						.appendTo('#saved_selectors');
				}
			} else {
				var index = saveRule(selector_object);
				selector_object.index = index;
				// call last because index needs to be set
				addSavedSelector(selector_object);
			}
			clearInterface();
		});

		// remove selector rule from localstorage
		$('#saved_selectors, #desired_selectors').on('click', '.deltog', function(event){
			event.stopPropagation();
			$(this).parents('.collect_group').remove();
			var selector_span = this.previousElementSibling,
				index = parseInt(selector_span.dataset['index'], 10);
			if ( isNaN(index) ){
				return;
			} else {
				deleteRule(index);
			}
			
		});

		// load saved selector information into the #selector_form for editing
		$('#saved_selectors').on('click', '.saved_selector', clearOrLoad);
		$('#desired_selectors').on('click', '.desired_selector', clearOrLoad);

		function clearOrLoad(event){
			event.stopPropagation();
			var _this = $(this);
			if ( _this.hasClass('active_selector') ) {
				clearInterface();
			} else {
				loadSelectorGroup(this);
			}
		}
		
		// output a preview of current selector form values to the console
		// to preview what it returns
		$('#collect_preview').click(function(event){
			event.preventDefault();
			var selector = $('#selector_string').val(),
				eles = selectorElements(selector),
				type = $('#selector_capture').val();
			if ( selector === '' || type === '' ) {
				console.log("No attribute to capture");
			} else if ( type === 'text' ) {
				eles.each(function(){
					console.log($(this).text());
				});
			} else if ( type.indexOf('attr-') === 0 ) {
				var attr = type.slice(type.indexOf('-')+1);
				eles.each(function(){
					console.log($(this).prop(attr));
				});
			}
		});

		$('#collect_clear_form').click(function(event){
			event.preventDefault();
			clearInterface();
		});

		// show saved rules in the interface
		$('#collect_load').click(function(event){
			event.preventDefault();
			var rules = getRules();
			$('#saved_selectors').html('');
			for ( var i=0, len=rules.length; i<len; i++){
				var curr = rules[i];
				if ( curr ){
					addSavedSelector(curr);
				}
			}
		});

		// clear out localstorage
		$('#collect_clear').click(function(){
			event.preventDefault();
			clearRules();
			clearInterface();
			$('#saved_selectors').html('');
		});

		$('#collect_preview_saved').click(function(event){
			event.preventDefault();
			clearInterface();
			var rules = getRules();
			$('#saved_selectors').html('');
			for( var i=0, ruleLen = rules.length; i<ruleLen; i++ ) {
				var curr, results, resultsLen, prop;
				curr = rules[i];
				addSavedSelector(curr);
				results = document.querySelectorAll(curr.selector);
				resultsLen = results.length;
				if (curr.capture==="text") { 
					prop = function(ele){
						return ele.innerText;
					}
				} else if (curr.capture.indexOf("attr-")===0) {
					var attribute = curr.capture.split('-')[1];
					prop = function(ele){
							return ele.getAttribute(attribute);
					};
				}
				console.group("%s, count: %s", curr.name, resultsLen);
				for (var r=0; r<resultsLen; r++ ) {
					var ele = results[r];
					$(ele).addClass("saved_preview");
					console.log(prop(ele));
				}
				console.groupEnd();
			}
		});

		$('#selector_parts')
			.on('click', '.child_toggle', function(event){
				event.stopPropagation();
			})
			.on('blur', '.child_toggle', function(event){
				event.stopPropagation();
				// verify that nth-child is legitimate input
				var _this = $(this),
					text = _this.text().toLowerCase(),
					/* matches nth-child selectors:
						odd, even, positive integers, an+b, -an+b
					*/
					child_match = /^(?:odd|even|-?\d+n(?:\s*(?:\+|-)\s*\d+)?|\d+)$/;
				if ( text.match(child_match) === null ) {
					// if input is bad, reset to 1 and turn the selector off
					_this.text('1').parent().addClass('off');
				}
				updateInterface();
			})
			.on('click', '.toggleable', function(){
				$(this).toggleClass('off');
				updateInterface();
			})
			.on('mouseenter', '.group_options', function(event){
				event.stopPropagation();
			})
			.on('mouseenter', '.selector_group', function(){
				var index = 0,
					elem = this,
					selector;
				while ( (elem=elem.previousElementSibling) !== null ) {
					index++;
				}
				// + 1 to include the hovered selector
				selector = baseSelector(index + 1);
				clearClass('collect_highlight');
				selectorElements(selector).addClass('collect_highlight');
			})
			.on('mouseleave', '.selector_group', function(){
				clearClass('collect_highlight');
			})
			.on('click', '.deltog', function(){
				$(this).parents('.selector_group').remove();
				updateInterface();
			})
			.on('click', '.nthchild', function(){
				addPseudoElement('nth-child', this);					
			})
			.on('click', '.nthtype', function(){
				addPseudoElement('nth-of-type', this);
				
			});
	}

	//addInterface helpers

	// add interactive identifier for saved selectors
	function addSavedSelector(obj){
		var selectorString = '<span class="collect_group no_select">' + 
			'<span class="saved_selector no_select" data-selector="' + obj.selector + 
			'" data-capture="' + obj.capture + '" data-index="' + obj.index + '">' + obj.name + 
			'</span><span class="deltog no_select">x</span></span>';
		$('#saved_selectors').append(selectorString);
	}

	// sets the fields in the #selector_form given an element 
	// that represents a selector
	function loadSelectorGroup(ele){
		var _this = $(ele),
			selector = decodeURIComponent(_this.data('selector')
				.replace(/\+/g, ' ')),
			name = _this.text(),
			capture = _this.data('capture');
		$('#selector_name').val(name);
		$('#selector_string').val(selector);
		$('#selector_capture').val(capture);
		if ( selector !== '' ){
			selectorInterface(selector);
			clearClass("query_check");
			selectorElements(selector).addClass("query_check");
		}
		clearClass('active_selector');
		_this.addClass('active_selector');
	}

	function addPseudoElement(pseudoSelector, ele){
		var _this = $(ele),
			parent = _this.parents('.selector_group'),
			html = pseudoHTML(pseudoSelector);
		parent.children('.pseudo').remove();
		parent.children('.toggleable').last().after($(html));
		// make sure the element is on so this selector makes sense
		parent.children('.toggleable').eq(0).removeClass('off');
		updateInterface();
	}

	// end addInterface helpers


	// localstorage related functions

	/*
	saves @rule to localStorage.rules array
	if @index is included, override current rule saved at @index, otherwise
	append to end of array
	returns index of rule in localStorage.rules
	*/
	function saveRule(rule, index){
		var rules = getRules(),
			newIndex;
		if ( index ) {
			rules[index] = rule;
			newIndex = index;
		} else {
			// grab before pushing since its 0 based
			newIndex = rules.length;
			rule.index = rule.index || newIndex;
			rules.push(rule);
		}
		setRules(rules);
		return newIndex;
	}

	function getRules(){
		return JSON.parse(localStorage.rules);
	}

	function setRules(arr){
		localStorage.rules = JSON.stringify(arr);
	}

	function deleteRule(index){
		var rules = getRules(),
			rulesLen = rules.length,
			newRules = [];
		for ( var i=0; i<rulesLen; i++ ) {
			var curr = rules[i];
			if ( index === i ){
				$(curr.selector).removeClass('saved_preview')
				continue;
			} else {
				// decrement index for values after removed index
				curr.index = (i < index) ? i : (i-1) ;
				newRules.push(curr);
			}
		}
		setRules(newRules);
	}

	function clearRules(){
		delete localStorage.rules;
		localStorage.rules = "[]";
	}



	/*
	options modal and selection options
	*/
	function addOptions(){
		var options_html = "<div id=\"options_background\"></div><section id=\"options_interface\" class=\"options\"><h2 >Options</h2><p><label for=\"tables\">Hide Table Elements</label><input type=\"checkbox\"  name=\"tables\" id=\"tables\" /></p><p><label for=\"visible\">Only include visible elements</label><input type=\"checkbox\"  name=\"visible\" id=\"visible\" /></p><a href=\"#\" id=\"close_options\">Close</a></section>",
			options_element = $(options_html);
		options_element.appendTo('body');
		$('#options_background, #options_interface, #options_interface *').addClass('no_select');
		$("#open_options, #close_options, #options_background").click(function(event){
			event.preventDefault();
			event.stopPropagation();
			options_element.toggle();
		});

	}

	/*
	takes an element and applies the rules based on the options, returning true if it passes
	all requirements
	*/
	function testSelectorRules(ele){
		// Include Table Elements rule
		var ignored_tags = ['TABLE', 'TBODY', 'TR','TD', 'THEAD', 'TFOOT',
			'COL', 'COLGROUP'],
			no_tables = $('#tables').is(':checked');
		if ( no_tables && ignored_tags.indexOf( ele.tagName ) > -1 ) {
			return false;
		}
		return true;
	}
	
	/*
	iterates over selector group elements and builds a string based on 
	toggleable elements that are not 'off'
	*/
	function baseSelector(index) {
		var groups = $('#selector_parts .selector_group'),
			selector = '',
			group_selector = '',
			togChildren,
			len = index || groups.length,
			group_text = [];
		for (var g=0; g < len; g++) {
			group_selector = '';
			togChildren = groups.eq(g).children('.toggleable');
			for ( var i=0, childrenLen=togChildren.length; i<childrenLen; i++ ) {
				var curr = togChildren.eq(i);
				// blank if
				// if index is undefined, elements with class off will add empty
				// string, but when index is defined, we want all elements
				//included
				group_selector += (curr.hasClass('off') && 
					index===undefined) ? '' : curr.text();
			}
			if ( group_selector !== '' ) {
				group_text.push(group_selector);
			}
		}
		selector = group_text.join(' ');
		return selector;
	}

	/*
	given a selector, apply user options, exclude .no_select elements, 
	and return jquery array
	*/
	function selectorElements(selector) {
		if ( $('#visible').is(':checked') ) {
			selector += ':visible';
		}
		selector += ':not(.no_select)';
		return $(selector);
	}

	/*
	updates the interface based on the states of the (.selector_group)s
	*/	
	var updateInterface = (function(){
		/*
		because the interface has a fixed position, anything that overflows 
		has to be hidden, so modify which direction the dropdown goes to 
		prevent it from being cut off
		*/
		function fixDropdownOverflow(){
			var interface_left = $('#collect_interface').offset().left,
				groups = $('.group_options');
			groups.each(function(){
				var _this = $(this),
					group_left = _this.offset().left;
				if ( group_left - interface_left < 80 ) {
					$('.group_dropdown', _this).css({'left':'0', 'right':''});
				} else {
					$('.group_dropdown', _this).css({'right':'0', 'left':''});
				}
			});
		}

		return function(){
			var selector = baseSelector(),
				selected;
			fixDropdownOverflow();
			clearClass('query_check');
			clearClass('collect_highlight');
			$('#collect_error').html('');
			if (selector === ''){
				$('#selector_count').html("Count: 0");
				$('#selector_string').val("");
				$('#selector_text').html("");
			} else {
				selected = selectorElements(selector);
				selected.addClass('query_check');
				$('#selector_count').html("Count: " + selected.length);
				$('#selector_string').val(selector);
				var text = selectorText(selected[0])
				$('#selector_text').html(text || "no text");
			}
		};
	})();

	// purge a classname from all elements with it
	function clearClass(name){
		$('.'+name).removeClass(name);
	}

	// reset the form part of the interface
	function clearInterface(){
		$('#selector_form input').val('');
		$('#selector_parts, #selector_count, #selector_text').html('');
		$('#collect_error').html('');
		clearClass('query_check');
		clearClass('active_selector');
		clearClass('saved_preview');
	}

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

	// selectorText helpers

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

	// end selectorText helpers

	/*
	given a css selector string, create .selector_groups for #selector_parts
	*/
	function selectorInterface(selector){
		var groups = selector.split(' '),
			curr,
			$curr,
			selector_groups = '';
		for ( var i=0, len=groups.length; i < len; i++ ) {
			curr = groups[i];
			$curr = $(groups[i]);
			if ( $curr.length ) {
				var s = new Selector($curr.get(0));
				selector_groups += s.toHTML(true);
			}
			// handle pseudo classes
			if ( curr.indexOf(':') !== -1 ){
				// 0 - full match
				// 1 - pseudoselector's name
				// 2 - index
				var pseudos = curr.match(/:(.+?)\((.+?)\)/);
				if ( pseudos.length === 3 ) {
					// strip off the closing span tag and 
					//add pseudoselector toggleable
					var first_half = selector_groups.slice(0,-231),
						second_half = selector_groups.slice(-231);
					selector_groups = first_half + 
						pseudoHTML(pseudos[1], pseudos[2]) +
						second_half;
				}
			}
			selector_groups += ' ';
		}
		$(selector).addClass('query_check');
		$('#selector_parts').html(selector_groups);
	}

	function pseudoHTML(selector, val) {
		return "<span class='pseudo toggleable no_select'>:" + 
			selector + "(<span class='child_toggle' title='options: an+b " + 
			"(a & b are integers), a positive integer (1,2,3...), odd, even'" + 
			"contenteditable='true'>" + (val || 1 ) + "</span>)</span>";
	}

	/*
	given an html element, create .selector_group elements to represent 
	all of the elements in range (body, @ele]
	*/
	function elementInterface(ele){
		var long_selector = '';
		clearClass('collect_highlight');
		if ( !ele ) {
			return;
		}
		// get option, not select
		if ( ele.tagName === "SELECT" ) {
			ele = ele.children[0];
		}
		long_selector = elementSelector(ele);
		$('#selector_parts').html(long_selector);
		updateInterface();
	}


	/*
	returns the html for a set of "group selectors" used to describe the ele 
	argument's css selector from one step above the body to the element each 
	group selector conssists of a toggleable span for the element's tag, as well
	as id and any classes if they exist (and a delete button to get rid of that 
	group selector) a toggleable element can be turned on/off
	to test what is selected when it is/isn't included in the query selector
	*/
	function elementSelector(ele) {
		var ele_selector,
			selector = '',
			count = 0,
			toggle_on = true;
		// stop generating selector when you get to the body element
		while ( ele.tagName !== "BODY" ){
			if ( !testSelectorRules(ele) ) {
				ele = ele.parentElement;
				continue;
			}
			ele_selector = new Selector( ele );
			// default 'off' class for all parent elements
			if ( count++ > 0 ) {
				toggle_on = false;
			}
			selector = ele_selector.toHTML( toggle_on ) + ' ' + selector;
			ele = ele.parentElement;
		}
		return selector;
	}

	/********************
	END PRIVATE FUNCTIONS
	********************/


	/********************
		SELECTOR OBJECT
	********************/
	function Selector( ele ){
		this.tag = ele.tagName;
		this.id = ele.hasAttribute('id') ? 
			'#' + ele.getAttribute('id') : undefined;
		this.classes = [];
		for ( var i=0, len=ele.classList.length; i<len; i++ ) {
			var curr = ele.classList[i];
			if ( curr === "collect_highlight" || curr === "query_check" ) {
				continue;
			}
			this.classes.push( '.' + curr );
		}
	}

	/*
	returns the html for a selector group
	*/
	Selector.prototype.toHTML = function( on ){
		function wrap_toggleable( to_wrap ) {
			return "<span class='toggleable no_select " + (on ? "":"off") + 
				"'>" + to_wrap + "</span>";
		}
		var selector = wrap_toggleable(this.tag.toLowerCase());
		if ( this.id ) {
			selector += wrap_toggleable(this.id);
		}
		if ( this.classes.length ) {
			for ( var pos=0, len=this.classes.length; pos < len; pos++ ) {
				selector += wrap_toggleable(this.classes[pos]);
			}
		}

		return "<span class='selector_group no_select'>" + selector +
				"<span class='group_options no_select'>&#x25bc;" + 
					"<div class='group_dropdown no_select'>"+
						"<p class='nthchild no_select'>:nth-child</p>" +
						"<p class='nthtype no_select'>:nth-of-type</p>" +
						"<p class='deltog no_select'>Remove</p>" + 
					"</div>" +
				"</span>" + 
			"</span>";
	};

	/********************
	END SELECTOR OBJECT
	********************/
	return Collect;	
};

var v = "1.9.1"
if (window.jQuery === undefined || window.jQuery.fn.jquery < v) {
	var done = false,
		script = document.createElement("script");
	script.src = "https://ajax.googleapis.com/ajax/libs/jquery/" + v + "/jquery.min.js";
	script.onload = script.onreadystatechange = function(){
		if (!done && (!this.readyState || 
				this.readyState === "loaded" || 
				this.readyState === "complete")) {
			done = true;
			// because jquery is attached to widnow, 
			// noconflict to prevent interfering with
			// native page's jquery
			var jQuery191 = jQuery.noConflict();
			window.collect = makeCollect(jQuery191);
			window.collect.setup();
		}
	};

	document.getElementsByTagName("head")[0].appendChild(script);
} else {
	window.collect = makeCollect(jQuery);
	window.collect.setup();
}
})();
