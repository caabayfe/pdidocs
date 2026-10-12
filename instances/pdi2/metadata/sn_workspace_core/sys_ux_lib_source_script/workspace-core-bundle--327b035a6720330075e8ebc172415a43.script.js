function () {
    var baseUrl = '/scripts/agent_workspace_16/';
	var bundleBase = baseUrl + 'agent-workspace.';
	var ws = [
	  bundleBase + 'runtime.min.js',
	  bundleBase + 'vendor~main.min.js',
	  bundleBase + 'vendor~form.js~page.js~renderers.js~ws.js.min.js',
	  bundleBase + 'vendor~form.js~page.js~ws.js.min.js',
	  bundleBase + 'vendor~form.js~renderers.js~ws.js.min.js',
	  bundleBase + 'vendor~form.js~ws.js.min.js',
	  bundleBase + 'vendor~ws.js.min.js',
	  bundleBase + 'main.min.js',
	  bundleBase + 'ws.js.min.js'
	];
	var form = [
	  bundleBase + 'vendor~form.js~page.js~renderers.js.min.js',
	  bundleBase + 'vendor~form.js~page.js.min.js',
	  bundleBase + 'vendor~form.js~renderers.js.min.js',
	  bundleBase + 'vendor~form.js.min.js',
	  bundleBase + 'form.js.min.js'
	];
	var page = [
	  bundleBase + 'vendor~form.js~page.js~renderers.js.min.js',
	  bundleBase + 'vendor~form.js~page.js.min.js',
	  bundleBase + 'vendor~page.js~renderers.js.min.js',
	  bundleBase + 'vendor~page.js.min.js',
	  bundleBase + 'page.js.min.js'
	];
	var renderer = [
	  bundleBase + 'vendor~form.js~page.js~renderers.js.min.js',
	  bundleBase + 'vendor~form.js~renderers.js.min.js',
	  bundleBase + 'vendor~page.js~renderers.js.min.js',
	  bundleBase + 'vendor~renderers.js.min.js',
	  bundleBase + 'renderers.js.min.js'
	];

	return snComponentLoader.load([ws], { polyfillBaseUrl: baseUrl + "polyfills" }).then(function () {
		return snComponentLoader.load([form, renderer], { polyfillBaseUrl: baseUrl + "polyfills" })
	}).then(function () {
		setTimeout(function () { snComponentLoader.load([page], { polyfillBaseUrl: bundleBase + "polyfills" }); }, 1000);
		return true;
	});
}
