(function(d,t){
	var j=d.createElement(t),
		s=d.getElementsByTagName('head')[0];
	j.src="http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js";
	s.appendChild(j);
})(document);


var collect = (function($){

	var Collect = {
		css: "border:1px solid blue !important;",
		elements: "a,input,img,div,span,select,option,li,p,ul,ol,li,h1,h2,h3,h4,h5,h6,section,dl,dt,dd",
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

					$('#selector_parts').on('click', '.toggleable', function(){
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
				}
			};

		function select(event){
			event.stopPropagation();
			/*
			ignore if a part of the tuple_collector div
			*/
			if ( highlighted ) {
				highlighted.removeClass('highlight');
			}
			if ( $(this).hasClass('no_select') ) {
				return;
			}
			highlighted = $(this).addClass('highlight');
		}

		function deselect(event){
			event.stopPropagation();
			$(this).removeClass('highlight');
			highlighted = undefined;
		}

		function get_query_selector(event){
			event.preventDefault();
			event.stopPropagation();
			/*
			ignore if a part of the tuple_collector div
			*/
			if ( $(this).hasClass('no_select') ) {
				return;
			}
			var long_selector = get_element_selector(this);
			$('#selector_parts').html(long_selector);
			test_selector();
		}

		return event_obj;
	})();

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
			$('#selector_count').html(0);
			$('#selector_curr').html(selector);
			$('#selector_text').html("no query selector given");
			return;
		}
		selected = $( selector + ':not(.no_select)');
		selected.addClass('query_check');
		$('#selector_count').html(selected.length);
		$('#selector_curr').html(selector);
		$('#selector_text').html(selected.text() || "no text");
	}

	function get_element_selector(ele) {
		var selector = '',
			ele_selector = '',
			original_ele = ele,
			test_selector,
			count = 0,
			toggle_on = true,
			ignored_tags = ['TABLE', 'TBODY', 'TR','TD'];
		while( ele.tagName !== "BODY" ){
			if ( ignored_tags.indexOf( ele.tagName ) > -1 ) {
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

	function Selector( ele ){
		this.tag = ele.tagName;
		this.id = ele.hasAttribute('id') ? '#' + ele.getAttribute('id') : undefined;
		this.classes = ele.classList;
	}

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
				if ( curr === "highlight" || curr === "query_check" ) {
					continue;
				}
				selector += wrap_toggleable('.' + curr);
			}
		}
		return "<span class='selector_group no_select'>" + selector + "</span><span class='deltog no_select'>x</span>";
	}

	Collect.insert_css = function() {
		var s = document.createElement('style');
		s.innerText = ".highlight{" + this.css + "}" +
			"#tuple_collector{\
				position: fixed;\
				left: 25%;\
				bottom: 0;\
				width: 50%;\
				height: 250px;\
				border-width: 2px 2px 0 2px;\
				border-style: solid;\
				border-color: #444;\
				background: #fff;\
				z-index: 1000;\
				overflow-y: scroll;\
			}\
			#tuple_collector p{\
				float: none;\
				display: block;\
			}\
			#selector_parts{\
				line-height: 1.75em;\
			}\
			#selector_text{\
				max-height: 100px;\
				overflow-y: scroll;\
				overflow-x: hidden;\
			}\
			#selector_string{\
				width: 400px;\
			}\
			.deltog{\
				background:#efefef;\
				padding: 0 2px;\
				margin-right: 3px;\
				border-width: 1px 1px 1px 0;\
				border-style: solid;\
				border-color: #777;\
			}\
			.deltog:hover{\
				background: #666;\
				color: #efefef;\
			}\
			.highlight{\
				border: 1px solid blue !important;\
			}\
			 \
			.query_check { \
				background: yellow !important; \
				border: 1px solid yellow; \
			}\
			.selector_group{\
				border-width: 1px 0 1px 1px;\
				border-style: solid;\
				border-color: #777;\
				background: #ddd;\
			}\
			.toggleable{\
				color: #1A7332;\
			}\
			.off{\
			color: #f00;\
			text-decoration: line-through;\
			opacity: 0.4;\
			}";
		s.setAttribute('type','text/css');
		$('head').append(s);
	}

	function setup_interface() {
		var interface_html = '<div class="no_select" id="tuple_collector">' + 
		'<p class="no_select" id="selector_parts"></p>' + 
		'<p class="no_select" id="selector_curr"></p>' + 
		'<p class="no_select" id="selector_count"></p>' +
		'<p class="no_select" id="selector_text"></p>' +
		'<button class="no_select" id="off_button">Off</button>' +
		'</div>';
		$(interface_html).appendTo('body');
		var events_on = true;

		$('#off_button').click(function(){
			var _this = $(this);
			if ( events_on ) {
				Collect.events.off();
				_this.text('On');
			} else {
				Collect.events.on();
				_this.text('Off');
			}
			events_on = !events_on;
		})
		$('#selector_parts').on('click', '.deltog', function(){
			var parent = this.parentElement,
				prev = this.previousSibling;
			parent.removeChild(prev);
			parent.removeChild(this);
		})

	}


	Collect.setup = function(args){
		if ( arguments.length !== 0 ) {
			this.css = args.css || this.css;
			this.elements = args.elements || this.elements;
		}
		setup_interface();
		Collect.insert_css();

		Collect.events.on();
	}

	return Collect;	
})(jQuery);

collect.setup()