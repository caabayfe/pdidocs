function onSubmit() {
	var type = g_form.getValue('type');
	if (type !== 'ui_page')
		return true;

	var scope = g_scratchpad.scope;
	if (!scope || scope == 'global') // only apply to scoped apps
		return true;

	var name = g_form.getValue('name');
	if (name.indexOf(scope) !== 0) {
		console.error('name is not prefixed')
		showError('scoped ui page error: name must start with {scope}', {scope: scope})
		return false
	}
	if (name.match(/[^0-9a-zA-Z_\$]/)) {
		showError('name can only contain alphanumeric characters, underscores or dollar signs')
		return false;
	}
	function showError(msg, replacements) {
		getMessage(msg, function(iMsg) {
			if (replacements) {
				iMsg = iMsg.replace(/{([^{}]*)}/g, function(a, b) {
					var r = replacements[b];
					return typeof r === 'string' || typeof r === 'number' ? r : a;
				});
			}

			g_form.addErrorMessage(iMsg)
		})
	}
}
