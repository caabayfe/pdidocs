function invokeFunction(submissionType) {
	var gdw = GlideDialogWindow.get();
	var f;
	if (submissionType == 'modify')
		f = gdw.getPreference('dupSAModify');
	else if (submissionType == 'continue')
		f = gdw.getPreference('dupSAContinue');

	if (typeof(f) == 'function')
		f.call();

	return false;
}

function onClickOK() {
	invokeFunction('modify');
}

function onClickCancel() {
	invokeFunction('continue');
}
