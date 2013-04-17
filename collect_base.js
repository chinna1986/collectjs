/*
load jquery, then make collect object and setup. format could use some work, but is alright for
the time being
*/
(function(){
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

	var make_collect = function($){
		/***************
		COLLECT OBJECT
		***************/
		var Collect = {
			highlight_css: "border:1px solid blue !important;",
			check_css: "background: yellow !important; border: 1px solid yellow;",
			elements: "*:not(body)"
		}

		Collect.setup = function(args){
			if ( arguments.length !== 0 ) {
				this.highlight_css = args.highlight_css || this.highlight_css;
				this.check_css = args.check_css || this.check_css;
				this.elements = args.elements || this.elements;
			}
			setup_interface();
			Collect.insert_css();
			Collect.events.on();
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
				/*
				ignore if a part of the collect_interface div
				*/
				if ( highlighted ) {
					highlighted.removeClass('highlight');
				}
				if ( $(this).hasClass('no_select') ) {
					return;
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
				/*
				ignore if a part of the collect_interface div
				*/
				event.stopPropagation();
				//	let the event happen for input elements
				if (this.tagName !== 'INPUT'){
					event.preventDefault();
				}
				if ( this === null || $(this).hasClass('no_select') ) {
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

		Collect.insert_css = function() {
			var s = document.createElement('style');
			s.innerText = ".highlight{" + this.highlight_css + "}" +
				".query_check {" + this.check_css + "}" + "{{collect.css}}";
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
		/***************
		END COLLECT OBJECT
		***************/

		/********************
		PRIVATE FUNCTIONS
		********************/
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

			return selector;
		}

		function test_selector() {
			var selector = get_test_selector(),
				selected;
			$('.query_check').removeClass('query_check');
			/* break if no selector returned */
			if (selector === ''){
				$('#selector_count').html("Count: 0");
				$('#selector_curr').html("No selector");
				$('#selector_text').html("no query selector given");
				return;
			}
			selected = $( selector + ':not(.no_select)');
			selected.addClass('query_check');
			$('#selector_count').html("Count: " + selected.length);
			$('#selector_curr').html(selector);
			$('#selector_text').text(get_element_html(selected[0]) || "no text");
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
			var selector = '',
				ele_selector = '',
				original_ele = ele,
				test_selector,
				count = 0,
				toggle_on = true,
				ignored_tags = ['TABLE', 'TBODY', 'TR','TD', 'THEAD', 'TFOOT', 'COL', 'COLGROUP'],
				ignore_tables = !$('#tables').is(':checked');
			while( ele.tagName !== "BODY" ){
				if ( ignore_tables && ignored_tags.indexOf( ele.tagName ) > -1 ) {
					ele = ele.parentElement;
					continue;
				}
				ele_selector = new Selector( ele );
				if ( count++ > 0 ) {
					toggle_on = false;
				}
				selector = ele_selector.toHTML( toggle_on ) + ' ' + selector;
				ele = ele.parentElement;
			}
			return selector;
		}

		function setup_interface() {
			var interface_html = '{{collect.html}}';

			$(interface_html).appendTo('body');
			var events_on = true;

			$('#close_selector').click(function(event){
				event.stopPropagation();
				Collect.events.off();
				$('.query_check').removeClass('query_check');
				$('.highlight').removeClass('highlight');
				$('#collect_interface').remove();
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
				} else {
					interface.removeClass('attach_bottom').addClass('attach_top');
				}
			})

			$('#selector_parts').on('click', '.deltog', function(){
				var parent = this.parentElement,
					prev = this.previousSibling;
				parent.removeChild(prev);
				parent.removeChild(this);
			});
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
})();