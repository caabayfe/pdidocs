function onConfirm() {
	if (gel("cb").checked)
		disableWarning();
	var f;
	var gdw = GlideDialogWindow.get();
	f = gdw.getPreference('onConfirm');
	if (typeof(f) == 'function') {
        try {
            f.call(gdw);
        } catch(e) {
        }
    }
	gdw.destroy();
}

function disableWarning() {
	var ga = new GlideAjax('UpdateSetAjax');
	ga.addParam('sysparm_type', 'setAppInstallWarningPreference');
	ga.addParam('sysparm_disable', 'true');
	ga.getXML();
}

function onCancel() {
	var f;
	var gdw = GlideDialogWindow.get();
	f = gdw.getPreference('onCancel');
	if (typeof(f) == 'function') {
        try {
            f.call(gdw);
        } catch(e) {
        }
    }
	gdw.destroy();
}
