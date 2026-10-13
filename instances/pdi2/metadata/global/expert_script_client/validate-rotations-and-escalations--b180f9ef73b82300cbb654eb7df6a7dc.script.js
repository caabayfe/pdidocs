function onSubmit() {
    // clear any messages that may have been left there
    g_form.clearMessages();

    // we only need to validate the form if the user is moving to the next panel
    if (g_form.getActionName() != "previous")
        return validateRotation();

    return true;
}

function validateRotation() {
    showLoadingDialog();
    var rotationIntervalCountEl = closest(g_form.getElement('rotation_interval_count'), '.form-group');
    rotationIntervalCountEl.removeClassName('has-error');

    var result = true;
    var intervalCount = parseInt(g_form.getValue("rotation_interval_count"));
    if (isNaN(intervalCount) || intervalCount <= 0) {
        getMessage('"{0}" should be greater than zero', function(msg) {
            var formattedMsg = new GwtMessage().format(msg, g_form.getLabelOf("rotation_interval_count"));
            g_form.addErrorMessage(formattedMsg);
            rotationIntervalCountEl.addClassName('has-error');
        });
        result = false;
    }
    hideLoadingDialog();
    return result;
}

function closest(el, selector) {
	var matchesFn;

	// find vendor prefix
	['matches', 'webkitMatchesSelector', 'mozMatchesSelector', 'msMatchesSelector', 'oMatchesSelector'].some(function(fn) {
		if (typeof document.body[fn] == 'function') {
			matchesFn = fn;
			return true;
		}
		return false;
	});

	var parent;

	// traverse parents
	while (el) {
		parent = el.parentElement;
		if (parent && parent[matchesFn](selector)) {
			return parent;
		}
		el = parent;
	}

	return null;
}

function hideLoadingDialog() {
    loadingDialog.destroy();
}

function showLoadingDialog() {
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    loadingDialog = new dialogClass("dialog_loading", true, 300);
    loadingDialog.setPreference('table', 'loading');
    loadingDialog.render();
}
