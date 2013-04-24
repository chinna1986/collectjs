(function(){
	"use strict";
	var make_collect = function($){
		/***************
		COLLECT OBJECT
		***************/
		var Collect = {
			highlight_css: "border:1px solid blue !important;",
			check_css: "background: yellow !important; border: 1px solid yellow !important;",
			elements: "body *:not(.no_select)"
		};

		Collect.setup = function(args){
			if ( arguments.length !== 0 ) {
				this.highlight_css = args.highlight_css || this.highlight_css;
				this.check_css = args.check_css || this.check_css;
				this.elements = args.elements || this.elements;
			}
			this.make_interface();
			this.options();
			this.css();
			this.events.on();
		};

		Collect.events = (function(){
			var highlighted,
				event_obj = {
					on: function(){
						$(Collect.elements).on({
							mouseenter: select,
							mouseleave: deselect,
							click: get_query_selector
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
									child_match = /^(?:odd|even|-?\d+n(?:\s*\+\s*\d+)?|\d+)$/;
								if ( text.match(child_match) === null ) {
									// if input is bad, reset to 1 and turn the selector off
									_this
										.text('1')
										.parent().addClass('off');
								}
								update_interface();
							})
							.on('click', '.toggleable', function(){
								$(this).toggleClass('off');
								update_interface();
							});
					},
					off: function(){
						$(Collect.elements).off({
							mouseenter: select,
							mouseleave: deselect,
							click: get_query_selector
						});

						$('#selector_parts').off('click', '.toggleable');
										}
				};

			function select(event){
				event.stopPropagation();
				if ( highlighted ) {
					highlighted.removeClass('highlight');
				}
				// cache the currently highlighted object to prevent a future lookup
				highlighted = $(this).addClass('highlight');
			}

			function deselect(event){
				event.stopPropagation();
				$(this).removeClass('highlight');
				highlighted = undefined;
			}

			function get_query_selector(event){
				event.stopPropagation();
				event.preventDefault();
				if ( this === null ) {
					return;
				}
				var long_selector = '';
				/*
				when clicking on an option element, 'this' is the select element, so use the first
				child option so that that is included in the long selector
				*/
				if ( this.tagName === "SELECT" ) {
					long_selector = get_element_selector(this.children[0]);	
				} else {
					long_selector = get_element_selector(this);
				}
				$('#selector_parts').html(long_selector);
				update_interface();
			}

			return event_obj;
		})();

		Collect.css = function() {
			var s = document.createElement('style');
			s.setAttribute('id','collect-style');
			s.innerText = ".highlight{" + this.highlight_css + "}" +
				".query_check {" + this.check_css + "}" + "{{collect.css}}";
			s.setAttribute('type','text/css');
			$('head').append(s);
		};
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

		Collect.make_interface = function() {
			var interface_html = '{{collect.html}}';
			$(interface_html).appendTo('body');
			$('#collect_interface, #collect_interface *').addClass('no_select');
			this.interface_events();
		};

		Collect.interface_events = function(){
			var events_on = true;
			// turn off events for highlighting/selecting page elements
			$('#off_button').click(function(event){
				event.stopPropagation();
				var _this = $(this);
				if ( events_on ) {
					Collect.events.off();
					_this.text('On');
					$('.query_check').removeClass('query_check');
					$('.highlight').removeClass('highlight');
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
				$('.query_check').removeClass('query_check');
				$('.highlight').removeClass('highlight');
				$('#collect_interface, #options_interface, #collect-style').remove();
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
			$("#selector_form").on('submit', function(event){
				event.preventDefault();
				var _this = $(this),
					serialized_form = _this.serialize(),
					inputs = serialized_form.split('&'),
					selector_object = {};
				for ( var i=0, len=inputs.length; i<len; i++ ) {
					var curr = inputs[i],
						equal_pos = curr.indexOf('='),
						name = curr.slice(0,equal_pos),
						input_data = curr.slice(equal_pos+1);
					selector_object[name] = input_data;
				}

				$('input', _this).val('');
			});

			
			$('#selector_parts')
				.on('click', '.deltog', function(){
					$(this).parents('.selector_group').remove();
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
					pseudo_html = "<span class='pseudo toggleable no_select off'>:" + pselector + "(" + 
						"<span class='child_toggle' contenteditable='true'>1</span>)</span>";
				parent.children('.pseudo').remove();
				parent.children('.toggleable').last().after($(pseudo_html));				
			}

			
		};

		/*
		options modal and selection options
		*/
		Collect.options = function(){
			var options_html = "{{options.html}}",
				options_element = $(options_html);
			options_element.appendTo('body');
			$('#options_interface, #options_interface *').addClass('no_select');

			$("#open_options, #close_options").click(function(event){
				event.preventDefault();
				event.stopPropagation();
				options_element.toggle();
			});

		};

		/*
		takes an element and applies the rules based on the options, returning true if it passes
		all requirements
		*/
		Collect.rules = function(ele){
			// Include Table Elements rule
			var ignored_tags = ['TABLE', 'TBODY', 'TR','TD', 'THEAD', 'TFOOT', 'COL', 'COLGROUP'],
				no_tables = !$('#tables').is(':checked');
			if ( no_tables && ignored_tags.indexOf( ele.tagName ) > -1 ) {
				return false;
			}

			return true;
		};
		/***************
		END COLLECT OBJECT
		***************/

		/********************
		PRIVATE FUNCTIONS
		********************/
		/*
		iterates over selector group elements and builds a string based on toggleable elements
		that are not switched off
		*/
		function get_test_selector() {
			var groups = $('#selector_parts .selector_group'),
				selector = '',
				group_selector = '',
				tog_children;
			for (var g=0, len=groups.length; g < len; g++) {
				group_selector = '';
				tog_children = groups.eq(g).children('.toggleable');
				for ( var i=0, children_len=tog_children.length; i<children_len; i++ ) {
					var curr = tog_children.eq(i);
					group_selector += curr.hasClass('off') ? '' : curr.text();
				}
				selector += (selector !== '' ? ' ':'') + group_selector;
			}
			selector = selector.replace(/\s+/g, ' ');
			return selector;
		}

		function update_interface(){
			var selector = get_test_selector();
			$('.query_check').removeClass('query_check');
			var selected;
			$('#selector_capture').val('');
			if (selector === ''){
				$('#selector_count').html("Count: 0");
				$('#selector_string').val("");
				$('#selector_text').html("");
				return;
			} else {
				selected = $( selector + ':not(.no_select)');
				selected.addClass('query_check');
				$('#selector_count').html("Count: " + selected.length);
				$('#selector_string').val(selector);
				$('#selector_text').html(make_selector_text(selected[0]) || "no text");
			}
		}

		function make_selector_text(element) {
			function wrap_property(ele, val, before, after){
				return (before || '') + '<span class="capture no_select" title="click to capture ' + val +
					' property" data-capture="' + val + '">' + ele + '</span>' + (after || '');
			}

			function escape_regexp(str) {
				return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
			}

			var tag_properties, curr, attr, replace_regexp,
				html_tag_regex = /<[^\/].+?>/g,
				property_regex = /[a-zA-Z\-_]+=('.*?'|".*?")/g,
				text_regex = />(.+?)</g,
				no_children = !$('#full_text').is(':checked'),
				broken_text = get_element_html(element, no_children),
				// remove whitespace for regexp
				text = broken_text.replace(/(\s\s+|[\n\t]+)/g, ''),
				tags = text.match(html_tag_regex),
				text_val = text.match(text_regex),
				text_check = {},
				properties = [],
				property_check = {};
			// find tag attributes
			for( var e=0, tag_len=tags.length; e<tag_len; e++ ) {
				tag_properties = tags[e].match(property_regex);
				if ( tag_properties ) {
					// add unique attributes to properties array
					for( var p=0, tag_prop_len=tag_properties.length; p<tag_prop_len; p++ ) {
						curr = tag_properties[p];
						if ( !property_check[curr] ) { 
							properties.push(tag_properties[p]);
							property_check[curr] = true;
						}
						
					}
				}
			}
			text = text.replace(/</g,'&lt;').replace(/>/g,'&gt;');
			// replace properties with capture spans
			for( var i=0, prop_len=properties.length; i<prop_len; i++ ) {
				curr = properties[i];
				attr = curr.slice(0, curr.indexOf('='));
				replace_regexp = new RegExp(escape_regexp(curr), 'g');
				text = text.replace(replace_regexp, wrap_property(curr, 'attr-' + attr));
			}
			// create capture spans with 'text' targets on all text
			if( text_val ) {
				for( var t=0, text_len=text_val.length; t<text_len; t++) {
					curr = text_val[t].replace(/</g,'&lt;').replace(/>/g,'&gt;');
					if ( !text_check[curr] ){
						text_check[curr] = true;
						var text_replace_regexp = new RegExp(escape_regexp(curr), 'g');
						text = text.replace(text_replace_regexp,
							wrap_property(curr.slice(4,-4), 'text', '&gt;', '&lt;'));
					}
				}
			}
			return text;
		}
		/*
		returns the html code for the ele argument
		*/
		function get_element_html(ele, no_children){
			if (!ele){
				return '';
			}
			var holder = document.createElement('div'),
				copy = ele.cloneNode(true);
			$(copy).removeClass('query_check').removeClass('highlight');
			if ( no_children ) {
				$(copy).html('...');
			}
			holder.appendChild(copy);
			return holder.innerHTML;
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
			while( ele.tagName !== "BODY" ){
				if ( !Collect.rules(ele) ){
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
			this.classes = ele.classList;
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
				for( var pos=0, len=this.classes.length; pos < len; pos++ ) {
					var curr = this.classes[pos];
					// don't add classes added by this script
					if ( curr === "highlight" || curr === "query_check" ) {
						continue;
					}
					selector += wrap_toggleable('.' + curr);
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

	var v = "1.9.1";
	if (window.jQuery === undefined || window.jQuery.fn.jquery < v) {
		var done = false,
			script = document.createElement("script");
		script.src = "https://ajax.googleapis.com/ajax/libs/jquery/" + v + "/jquery.min.js";
		script.onload = script.onreadystatechange = function(){
			if (!done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
				done = true;
				var collect = make_collect(jQuery);
				collect.setup();
			}
		};
		document.getElementsByTagName("head")[0].appendChild(script);
	} else {
		var collect = make_collect(jQuery);
		collect.setup();
	}
	
})();