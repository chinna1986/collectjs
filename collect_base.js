(function(){
	"use strict";
	var make_collect = function($){
		/***************
		COLLECT OBJECT
		***************/
		var Collect = {
			highlight_css: "border:1px solid blue !important;",
			check_css: "background: yellow !important; border: 1px solid yellow !important;",
			elements: "body *:not(.no_select)",
			rules: []
		};

		Collect.setup = function(args){
			if ( arguments.length !== 0 ) {
				this.highlight_css = args.highlight_css || this.highlight_css;
				this.check_css = args.check_css || this.check_css;
				this.elements = args.elements || this.elements;
			}
			add_interface();
			add_options();
			add_css();
			this.events.on();
		};

		Collect.events = (function(){
			var event_obj = {
					on: function(){
						$(Collect.elements).on({
							mouseenter: select,
							mouseleave: deselect,
							click: get_query_selector
						});						
					},
					off: function(){
						$(Collect.elements).off({
							mouseenter: select,
							mouseleave: deselect,
							click: get_query_selector
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

			function get_query_selector(event){
				event.stopPropagation();
				event.preventDefault();
				if ( this === null ) {
					return;
				}
				set_selector_parts(this);
			}

			return event_obj;
		})();

		/*
		not yet implemented
		Collect.load = function(json_url){
			$.ajax({
				dataType: "json",
				url: json_url,
				success: function( data ) {
			}
			});
		};
		*/

		/***************
		END COLLECT OBJECT
		***************/

		/********************
		PRIVATE FUNCTIONS
		********************/

		function add_css() {
			var s = document.createElement('style');
			s.setAttribute('id','collect-style');
			s.innerText = ".collect_highlight{" + Collect.highlight_css + "}" +
				".query_check, .query_check * {" + Collect.check_css + "}" + "{{collect.css}}";
			s.setAttribute('type','text/css');
			$('head').append(s);
		}

		function add_interface() {
			var interface_html = "{{collect.html}}";
			$(interface_html).appendTo('body');
			$('#collect_interface, #collect_interface *').addClass('no_select');
			add_interface_events();
		}

		/*
		event listeners associated with elements inside of the collect_interface
		*/
		function add_interface_events(){
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
				$('#collect_interface, #options_interface, #collect-style, #options_background').remove();
			});

			// toggle interface between top and bottom of screen
			$('#move_position').click(function(event){
				event.stopPropagation();
				var collect_interface = $('#collect_interface');
				if ( collect_interface.hasClass('attach_top') ) {
					collect_interface.removeClass('attach_top').addClass('attach_bottom');
					$(this).text('Move to Top');
				} else {
					collect_interface.removeClass('attach_bottom').addClass('attach_top');
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
				var form = $('#selector_form'),
					serialized_form = form.serialize(),
					inputs = serialized_form.split('&'),
					selector_object = {};
				for ( var i=0, len=inputs.length; i<len; i++ ) {
					var curr = inputs[i],
						equal_pos = curr.indexOf('='),
						name = curr.slice(0,equal_pos),
						input_data = curr.slice(equal_pos+1);
					if ( input_data === '' ) {
						console.log('missing attribute: ' + name);
						return;
					}
					selector_object[name] = input_data;
				}
				if ( $('.active_selector').length ){
					$('.active_selector')
						.data('selector', selector_object.selector)
						.data('capture', selector_object.capture)
						.text(selector_object.name)
						.removeClass('active_selector');
				} else {
					add_saved_selector(selector_object);
					Collect.rules.push(selector_object);
				}
				clear_interface();
			});

			function add_saved_selector(obj){
				var saved = $('#saved_selectors');
				saved.append('<span class="saved_selector"' + 
					'data-selector="' + obj.selector + '" data-capture="' + obj.capture + '">' +
					obj.name + '</span>');
			}

			$('#saved_selectors').on('click', '.saved_selector', function(event){
				event.stopPropagation();
				var _this = $(this),
					selector = decodeURIComponent(_this.data('selector').replace('+', ' '));
				$('#selector_string').val(selector);
				$('#selector_name').val(_this.text());
				$('#selector_capture').val(_this.data('capture'));
				clearClass("query_check");
				$(selector).addClass("query_check");
				clearClass('active_selector');
				_this.addClass('active_selector');
			});

			$('#collect_preview').click(function(event){
				event.preventDefault();
				var selector = $('#selector_string').val(),
					eles = get_full_selector_elements(selector),
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

			$('#collect_clear').click(function(event){
				event.preventDefault();
				clear_interface();
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
					update_interface();
				})
				.on('click', '.toggleable', function(){
					$(this).toggleClass('off');
					update_interface();
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
					selector = get_base_selector(index + 1);
					clearClass('collect_highlight');
					get_full_selector_elements(selector).addClass('collect_highlight');
				})
				.on('mouseleave', '.selector_group', function(){
					clearClass('collect_highlight');
				})
				.on('click', '.deltog', function(){
					$(this).parents('.selector_group').remove();
					update_interface();
				})
				.on('click', '.nthchild', function(){
					add_pseudo('nth-child', this);					
				})
				.on('click', '.nthtype', function(){
					add_pseudo('nth-of-type', this);
					
				});

			function add_pseudo(pselector, ele){
				var _this = $(ele),
					parent = _this.parents('.selector_group'),
					pseudo_html = "<span class='pseudo toggleable no_select'>:" + pselector + "(" + 
						"<span class='child_toggle' " +
						"title='options: an+b (a & b are integers), a positive integer (1,2,3...), odd, even'" + 
						"contenteditable='true'>1</span>)</span>";
				parent.children('.pseudo').remove();
				parent.children('.toggleable').last().after($(pseudo_html));
				// make sure the element is on so this selector makes sense
				parent.children('.toggleable').eq(0).removeClass('off');
				update_interface();
			}

			
		}

		/*
		options modal and selection options
		*/
		function add_options(){
			var options_html = "{{options.html}}",
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
		function selector_rules(ele){
			// Include Table Elements rule
			var ignored_tags = ['TABLE', 'TBODY', 'TR','TD', 'THEAD', 'TFOOT', 'COL', 'COLGROUP'],
				no_tables = $('#tables').is(':checked');
			if ( no_tables && ignored_tags.indexOf( ele.tagName ) > -1 ) {
				return false;
			}

			return true;
		}
		
		/*
		iterates over selector group elements and builds a string based on toggleable elements
		that are not switched off
		*/
		function get_base_selector(index) {
			var groups = $('#selector_parts .selector_group'),
				selector = '',
				group_selector = '',
				tog_children,
				len = index || groups.length,
				group_text = [];
			for (var g=0; g < len; g++) {
				group_selector = '';
				tog_children = groups.eq(g).children('.toggleable');
				for ( var i=0, children_len=tog_children.length; i<children_len; i++ ) {
					var curr = tog_children.eq(i);
					group_selector += (curr.hasClass('off') && !index) ? '' : curr.text();
				}
				if ( group_selector !== '' ) {
					group_text.push(group_selector);
				}
			}
			selector = group_text.join(' ');
			return selector;
		}

		/*
		given a selector, apply user options, exclude .no_select elements, and return jquery array
		*/
		function get_full_selector_elements(selector) {
			if ( $('#visible').is(':checked') ) {
				selector += ':visible';
			}
			selector += ':not(.no_select)';
			return $(selector);
		}

		var update_interface = (function(){
			/*
			because the interface has a fixed position, anything that overflows has to be hidden,
			so modify which direction the dropdown goes to prevent it from being cut off
			*/
			function fix_dropdown_overflow(){
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
				var selector = get_base_selector(),
					selected;
				fix_dropdown_overflow();
				clearClass('query_check');
				clearClass('collect_highlight');
				clearClass('active_selector');
				$('#selector_capture').val('');
				$('#selector_name').val('');
				if (selector === ''){
					$('#selector_count').html("Count: 0");
					$('#selector_string').val("");
					$('#selector_text').html("");
				} else {
					selected = get_full_selector_elements(selector);
					selected.addClass('query_check');
					$('#selector_count').html("Count: " + selected.length);
					$('#selector_string').val(selector);
					$('#selector_text').html(make_selector_text(selected[0]) || "no text");
				}
			};
		})();

		function clearClass(name){
			$('.'+name).removeClass(name);
		}

		function clear_interface(){
			$('#selector_form input').val('');
			$('#selector_parts, #selector_count, #selector_text').html('');
			clearClass('query_check');
			clearClass('active_selector');
		}

		/*
		given an element, return html for selector text with "capture"able parts wrapped
		*/
		function make_selector_text(element) {
			var curr, attr, replace_regexp,
				html = clean_outerhtml(element).replace(/(\s\s+|[\n\t]+)/g, ''),
				tags = html.match(/<[^\/].+?>/g),
				text_val = $(element).text().replace(/(\s\s+|[\n\t]+)/g, ''),
				properties = [];
			// find tag attributes
			if ( tags ) {
				properties = unique_properties(tags);
			}

			html = html.replace(/</g,'&lt;').replace(/>/g,'&gt;');
			// replace properties with capture spans
			for ( var i=0, prop_len=properties.length; i<prop_len; i++ ) {
				curr = properties[i];
				attr = curr.slice(0, curr.indexOf('='));
				replace_regexp = new RegExp(escape_regexp(curr), 'g');
				html = html.replace(replace_regexp, wrap_property(curr, 'attr-' + attr));
			}

			// create capture spans with 'text' targets on all text
			if ( text_val !== '' ) {
				if ( text_val.length > 100 ){
					text_val = text_val.slice(0, 25) + "..." + text_val.slice(-25);
				}
				// strip preceding/trailing spaces
				text_val = text_val.replace(/</g,'&lt;').replace(/>/g,'&gt;');
				text_val = text_val.replace(/(^\s*|[\n\t]+|\s*$)/g, '');
				var regexp_string = '(?:&gt;\\s*)(' + escape_regexp(text_val) + ')(?:\\s*&lt;)',
					text_replace_regexp = new RegExp(regexp_string, 'g'),
					replace_string = wrap_property(text_val, 'text', '&gt;', '&lt;');
				html = html.replace(text_replace_regexp, replace_string);
			}
			return html;

			function clean_outerhtml(ele){
				if (!ele) {
					return '';
				}
				var copy = ele.cloneNode(true),
					$copy = $(copy),
					text = $copy.text();
				$copy.removeClass('query_check').removeClass('collect_highlight');
				if ( text.length > 100 ){
					text = text.slice(0, 25) + "..." + text.slice(-25);
				}
				$copy.html(text);
				return copy.outerHTML;
			}

			function wrap_property(ele, val, before, after){
				// don't include empty properties
				if ( ele.indexOf('=""') !== -1 ) {
					return '';
				}
				return (before || '') + '<span class="capture no_select" title="click to capture ' + val +
					' property" data-capture="' + val + '">' + ele + '</span>' + (after || '');
			}

			// escape a string for a new RegExp call
			function escape_regexp(str) {
				return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
			}

			function unique_properties(tags) {
				var property_regex = /[a-zA-Z\-_]+=('.*?'|".*?")/g,
					properties = [],
					property_check = {},
					tag_properties = tags.join('').match(property_regex);
				if ( tag_properties ) {
					// add unique attributes to properties array
					for ( var p=0, tag_prop_len=tag_properties.length; p<tag_prop_len; p++ ) {
						curr = tag_properties[p];
						if ( !property_check[curr] ) { 
							properties.push(tag_properties[p]);
							property_check[curr] = true;
						}
						
					}
				}
				return properties;
			}
		}

		function set_selector_parts(ele){
			var long_selector = '';
			clearClass('collect_highlight');
			if ( !ele ) {
				return;
			}
			// get option, not select
			if ( ele.tagName === "SELECT" ) {
				ele = ele.children[0];
			}
			long_selector = get_element_selector(ele);
			$('#selector_parts').html(long_selector);
			update_interface();
		}


		/*
		returns the html for a set of "group selectors" used to describe the ele argument's css 
		selector from one step above the body to the element each group selector conssists of a
		toggleable span for the element's tag, as well as id and any classes if they exist (and a
		delete button to get rid of that group selector) a toggleable element can be turned on/off
		to test what is selected when it is/isn't included in the query selector
		*/
		function get_element_selector(ele) {
			var ele_selector,
				selector = '',
				count = 0,
				toggle_on = true;
			// stop generating selector when you get to the body element
			while ( ele.tagName !== "BODY" ){
				if ( !selector_rules(ele) ) {
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
			this.id = ele.hasAttribute('id') ? '#' + ele.getAttribute('id') : undefined;
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
				return "<span class='toggleable no_select " + (on ? "":"off") + "'>" + 
					to_wrap + "</span>";
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

	var v = "1.9.1",
		collect;
	if (window.jQuery === undefined || window.jQuery.fn.jquery < v) {
		var done = false,
			script = document.createElement("script");
		script.src = "https://ajax.googleapis.com/ajax/libs/jquery/" + v + "/jquery.min.js";
		script.onload = script.onreadystatechange = function(){
			if (!done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
				done = true;
				// because jquery is attached to widnow, noconflict to prevent interfering with
				// native page's jquery
				var jQuery191 = jQuery.noConflict();
				collect = make_collect(jQuery191);
				collect.setup();
			}
		};

		document.getElementsByTagName("head")[0].appendChild(script);
	} else {
		collect = make_collect(jQuery);
		collect.setup();
	}
})();