#####Semi-abandoned in favor of being used as a Chrome extension
https://github.com/psherman/collectjs-chrome

Element CSS selector. Still very barebones.
Files: build.py, collect.css, collect.html, options.html, and collect_base.js are convenience files used to build collect.js without having to deal with javascript string formatting

To use as a bookmarklet, create a new bookmark with the following as the URL:

    javascript:(function(d,t){var j=d.createElement(t),s=d.getElementsByTagName(t)[0]||d.getElementsByTagName("link")[0];j.src="https://s3.amazonaws.com/collectjs/collect.js";s.parentNode.insertBefore(j,s);})(document,"script");
