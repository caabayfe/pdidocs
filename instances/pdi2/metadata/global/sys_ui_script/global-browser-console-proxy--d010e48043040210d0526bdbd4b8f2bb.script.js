function BrowserConsole() {
	var self = this;
	['info', 'error', 'debug', 'warn', 'log', 'clear', 'count', 'countReset', 'dir', 'dirxml', 'table']
		.forEach(function(method) {
		self[method] = function() {
			_notifications_.push({
				type: 'browser-console-' + method,
				message: [].slice.apply(arguments).join()
			});
		};
	});
}

var console = new BrowserConsole();

// TBD - intiailize the proxy in a global context with necessary args/inputs if required
// _globalProxyContext_['console'] = new BrowserConsole(inputs.url);
csGlobals['console'] = new BrowserConsole();
