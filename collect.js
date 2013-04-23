/*
load jquery, then make collect object and setup. format could use some work, but is alright for
the time being
*/
(function(){

	var make_collect = function($){
		/***************
		COLLECT OBJECT
		***************/
		var Collect = {
			highlight_css: "border:1px solid blue !important;",
			check_css: "background: yellow !important; border: 1px solid yellow;",
			elements: "body *:not(.no_select)"
		}

		Collect.setup = function(args){
			if ( arguments.length !== 0 ) {
				this.highlight_css = args.highlight_css || this.highlight_css;
				this.check_css = args.check_css || this.check_css;
				this.elements = args.elements || this.elements;
			}
			// ???
			this.interface();
			this.options();
			this.css();
			this.events.on();
		}

		Collect.events = (function(){
			var highlighted,
				event_obj = {
					on: function(event){
						$(Collect.elements).on({
							mouseenter: select,
							mouseleave: deselect,
							click: get_query_selector
						});
						$('#selector_parts').on('click', '.toggleable', function(event){
							event.stopPropagation();
							$(this).toggleClass('off');
							test_selector();
						});
					},
					off: function(event){
						$(Collect.elements).off({
							mouseenter: select,
							mouseleave: deselect,
							click: get_query_selector
						});

						$('#selector_parts').off('click', '.toggleable')
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
				when clicking on an option, 'this' is the select element, so use the first child
				option so that that is included in the long selector
				*/
				if ( this.tagName === "SELECT" ) {
					long_selector = get_element_selector(this.children[0]);	
				} else {
					long_selector = get_element_selector(this);
				}
				$('#selector_parts').html(long_selector);
				test_selector();
			}

			return event_obj;
		})();

		Collect.css = function() {
			var s = document.createElement('style');
			s.setAttribute('id','collect-style');
			s.innerText = ".highlight{" + this.highlight_css + "}" +
				".query_check {" + this.check_css + "}" + "#collect_interface{position: fixed;left: 25%;width: 50%;height: 200px;padding: 5px 20px;background: #fff;z-index: 1000;overflow-y: scroll;font-family: sans-serif;font-size: 12px;}#collect_interface *, #options_interface *{color: #222;}#collect_interface *, #options_interface *{text-align: left;}#collect_interface.attach_top{top: 0;border-width: 0 2px 2px;border-style: solid;border-color: #444;}#collect_interface.attach_bottom{bottom: 0;border-width: 2px 2px 0;border-style: solid;border-color: #444;}#collect_interface h2{font-size: 1.25em;font-weight: bold;}#collect_interface p{font-size: 1em;}#collect_interface p, #collect_interface h2{float: none;display: block;margin: 2px 0;}#control_buttons{position: absolute;top:0;right:0;}#collect_interface button{font-size: 12px;padding: 2px 5px;margin: 0;background: #efefef;border: 1px solid #444;border-right: 0;text-align: center;box-shadow: none;min-width: 0;border-radius: 0;}#collect_interface button:hover{cursor:pointer;}#collect_interface.attach_bottom button {border-top: 0;}#selector_parts{line-height: 1.75em;}#selector_string{width: 400px;}#collect_interface .toggleable{cursor: pointer;}#collect_interface .toggleable:hover{color: #FF0000;}#collect_interface .deltog{background:#efefef;padding: 2px;margin-right: 3px;border-width: 1px 1px 1px 0;border-style: solid;border-color: #777;}#collect_interface .deltog:hover{background: #666;color: #efefef;cursor: pointer;}#collect_interface .capture{border-width: 1px 0 1px 1px;border-style: solid;border-color: #777;background: #ddd;padding: 2px;cursor: pointer;}#collect_interface .selector_group{border: 1px solid #777;background: #ddd;padding: 2px;}#collect_interface .off{text-decoration: line-through;opacity: 0.4;}#collect_interface #selector_text{line-height: 1.5em;}#open_options{font-weight: bold;font-size: 1.25em;}/* options modal */#options_interface{display: none;position: fixed;width: 50%;background: #fff;border: 2px solid #444;top: 25%;left: 25%;padding: 10px;z-index: 1000;}/* non-interface css */.highlight{border: 1px solid blue !important;} .query_check { background: yellow !important; border: 1px solid yellow; }";
			s.setAttribute('type','text/css');
			$('head').append(s);
		}

		Collect.load = function(json_url){
			$.ajax({
			  dataType: "json",
			  url: json_url,
			  success: function( data ) {

			  }
			});
		}

		Collect.interface = function() {
			var interface_html = '<div class=\"attach_bottom\" id=\"collect_interface\"><section id=\"selector_results\"><h2 >Selector</h2><p id=\"selector_parts\"></p><p id=\"selector_count\"></p><p id=\"selector_text\"></p><p>Selector: <input name=\"selector\" id=\"selector_string\" val=\"\" /></p><p>Capture: <input name=\"capture\" id=\"selector_capture\" val=\"\" /></p></section><div id=\"control_buttons\"><button id=\"off_button\">Off</button><button id=\"close_selector\">Close</button><button id=\"move_position\">Move to Top</button></div></div>',
				events_on = true;

			$(interface_html).appendTo('body');
			$('#collect_interface, #collect_interface *').addClass('no_select');

			$('#close_selector').click(function(event){
				event.stopPropagation();
				Collect.events.off();
				$('.query_check').removeClass('query_check');
				$('.highlight').removeClass('highlight');
				$('#collect_interface, #options_interface, #collect-style').remove();
			});

			$('#off_button').click(function(event){
				event.stopPropagation();
				var _this = $(this);
				if ( events_on ) {
					Collect.events.off();
					_this.text('On');
				} else {
					Collect.events.on();
					_this.text('Off');
				}
				events_on = !events_on;
			});

			$('#move_position').click(function(event){
				event.stopPropagation();
				var interface = $('#collect_interface');
				if ( interface.hasClass('attach_top') ) {
					interface.removeClass('attach_top').addClass('attach_bottom');
					$(this).text('Move to Top');
				} else {
					interface.removeClass('attach_bottom').addClass('attach_top');
					$(this).text('Move to Bottom');
				}
			})

			$('#selector_parts').on('click', '.deltog', function(){
					var parent = this.parentElement,
						prev = this.previousSibling;
					parent.removeChild(prev);
					parent.removeChild(this);
				});
			$('#selector_text').on('click', '.capture', function(){
					var _this = $(this);
					$('#selector_capture').val( _this.data('capture') );
				});
		}


		/*
		options modal and selection options
		*/
		Collect.options = function(){
			var options_button = $('<a href="#" id="open_options">Options</a>'),
				options_element = $('<div id="options_interface">\
					<h2 >Options</h2>\
					<p>\
						<label for="tables">\
							Include Table Elements\
						</label>\
							<input type="checkbox" name="tables" id="tables" />\
					</p>\
					<a href="#" id="close_options">Close</a>\
				</div>');
			options_element.appendTo('body');
			$('#options_interface, #options_interface *').addClass('no_select');

			$("#close_options").click(function(event){
				event.preventDefault();
				event.stopPropagation();
				options_element.hide();
			});


			options_button
				.appendTo('#collect_interface')
				.addClass('no_select')
				.click(function(event){
					event.preventDefault();
					event.stopPropagation();
					options_element.show();
				});
		}

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
		}
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
			var groups = $('#selector_parts').children('.selector_group'),
				selector = '',
				group_selector = '';
			for (var g=0, len=groups.length; g < len; g++) {
				group_selector = '';
				groups.eq(g).children('.toggleable').each(function(){
					var curr = $(this);
					if ( !curr.hasClass('off') ) {
						group_selector += curr.text();
					}
				});
				selector += (selector != '' ? ' ':'') + group_selector;
			}
			selector = selector.replace(/\s+/g, ' ');
			return selector;
		}

		/*
		applies style to elements that are selected by the css selector and updates interface with
		information about the selector and its elements
		*/
		function test_selector() {
			var selector = get_test_selector();
			$('.query_check').removeClass('query_check');
			update_interface(selector);
			/* break if no selector returned */
			
		}

		function update_interface(selector){
			var selected;
			$('#selector_capture').val('');
			if (selector === ''){
				$('#selector_count').html("Count: 0");
				$('#selector_string').val("");
				$('#selector_text').html("");
				return;
			}
			selected = $( selector + ':not(.no_select)');
			selected.addClass('query_check');
			$('#selector_count').html("Count: " + selected.length);
			$('#selector_string').val(selector);
			$('#selector_text').html(make_selector_text(selected[0]) || "no text");
		}

		function make_selector_text(element) {
			function wrap_property(ele, val){
				return '<span class="capture" title="click to capture ' + val +
					' property" data-capture="' + val + '">' + ele + '</span>';
			}

			var html_tag_regex = /<[^\/].+?>/g,
				property_regex = /[a-zA-Z\-_]+=('.*?'|".*?")/g,
				text_regex = />(.+)</g,
				text = get_element_html(element),
				tags = text.match(html_tag_regex),
				text_val = text_regex.exec(text),
				properties = [],
				tag_properties;
			for( var e=0, len=tags.length; e<len; e++ ) {
				tag_properties = tags[e].match(property_regex);
				if ( tag_properties ) {
					for( var p=0, prop_len=tag_properties.length; p<prop_len; p++ ) {
						properties.push(tag_properties[p]);
					}
				}
			}
			text = text.replace(/</g,'&lt;').replace(/>/g,'&gt;');
			for( var i=0, len=properties.length; i<len; i++ ) {
				var curr = properties[i],
					attr = curr.slice(0, curr.indexOf('='))
				text = text.replace(curr, wrap_property(curr, 'attr-' + attr));
			}
			if ( text_val ) {
				var curr = text_val[1];
				text = text.replace(curr, wrap_property(curr, 'text'));
			}
			return text;
		}

		/*
		returns the html code for the ele argument
		*/
		function get_element_html(ele){
			if (!ele){
				return '';
			}
			var holder = document.createElement('div'),
				copy = ele.cloneNode(true);
			$(copy).removeClass('query_check').removeClass('highlight');
			holder.appendChild(copy);
			return holder.innerHTML;
		}

		/*
		returns the html for a set of "group selectors" used to describe the ele argument's css selector
		from one step above the body to the element
		each group selector conssists of a toggleable span for the element's tag, as well as id and any
		classes if they exist (and a delete button to get rid of that group selector)
		a toggleable element can be turned on/off to test what is selected when it is/isn't included
		in the query selector
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
					continue
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
			return "<span class='selector_group no_select'>" + selector + "</span><span class='deltog no_select'>x</span>";
		}

		/********************
		END SELECTOR OBJECT
		********************/

		return Collect;	

	}

	var v = "1.9.1";
	if (window.jQuery === undefined || window.jQuery.fn.jquery < v) {
		var done = false,
			script = document.createElement("script");
		script.src = "https://ajax.googleapis.com/ajax/libs/jquery/" + v + "/jquery.min.js";
		script.onload = script.onreadystatechange = function(){
			if (!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
				done = true;
				collect = make_collect(jQuery);
				collect.setup();
			}
		};
		document.getElementsByTagName("head")[0].appendChild(script);
	} else {
		collect = make_collect(jQuery);
		collect.setup();
	}
	
})();