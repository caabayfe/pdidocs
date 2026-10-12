var split = function (str) {
	return !str ? [] : str.split(/[, ]+/);
};
var toMap = function (arr) {
	return arr.reduce(function (a, c) { a[c] = 1; return a; }, {});
};

var getPropertyVersion = function(value) {
	if(value.indexOf('v4') >= 0)
		return '.v4';
	if(value.indexOf('v5') >= 0)
		return '.v5';
	return '';
};
var validPluginsProp = 'glide.ui.html.editor' + (getPropertyVersion(current.name)) + '.valid_plugins';

var currentPlugins = split(current.value);
var validPlugins = toMap(split(gs.getProperty(validPluginsProp)));

var currentValid = [];
var currentInvalid = [];
var currentUnique = {};

currentPlugins.forEach(function (plugin) {
	var arr = validPlugins[plugin] && !currentUnique[plugin] ? currentValid : currentInvalid;
	currentUnique[plugin] = 1;
	arr.push(plugin);
});

if (currentInvalid.length) {
	var invalid = currentInvalid.join(', ');
	var msg = gs.getMessage('Plugin list included the following invalid or duplicate plugins (have been removed): {0}', invalid);
	gs.addErrorMessage(msg);
	
	current.value = currentValid.join(' ');
}
