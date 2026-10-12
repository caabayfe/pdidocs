function transform(input) {
	var prefsObj = {};
	input.preferences.forEach(function(o) {
		prefsObj[o.name] = o.value;
	});
	return prefsObj;
}
