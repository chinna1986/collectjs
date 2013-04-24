Element CSS selector. Still very barebones.
Files: build.py, collect.css, collect.html, options.html, and collect_base.js are convenience files used to build collect.js without having to deal with javascript string formatting

javascript:(function(d,t){var j=d.createElement(t),s=d.getElementsByTagName(t)[0]||d.getElementsByTagName("link")[0];j.src="https://s3.amazonaws.com/collectjs/collect.js";s.parentNode.insertBefore(j,s);})(document,"script");