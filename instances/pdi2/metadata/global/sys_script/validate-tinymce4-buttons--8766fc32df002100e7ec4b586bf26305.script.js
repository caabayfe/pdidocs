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

var tinymceVersion = getPropertyVersion(current.name);
var validButtonsProp;
if (tinymceVersion === '.v4')
validButtonsProp = 'glide.ui.html.editor.v4.toolbar.valid.buttons';
else
validButtonsProp = 'glide.ui.html.editor' + tinymceVersion + '.toolbar.valid_buttons';

var currentButtons = split(current.value);
var validButtons = toMap(split(gs.getProperty(validButtonsProp)));
validButtons['|'] = 1;

var currentValid = [];
var currentInvalid = [];

currentButtons.forEach(function (button) {
	var arr = validButtons[button] ? currentValid : currentInvalid;
	arr.push(button);
});

if (currentInvalid.length) {
	var invalid = currentInvalid.join(', ');
	var msg = gs.getMessage('Toolbar button list included the following invalid buttons (have been removed): {0}', invalid);
	gs.addErrorMessage(msg);
	
	current.value = currentValid.join(' ');
}
