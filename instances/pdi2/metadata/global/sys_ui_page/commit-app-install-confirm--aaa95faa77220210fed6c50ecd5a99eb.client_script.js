function runCommit() {
	var f;
	var gdw = GlideDialogWindow.get();
	f = gdw.getPreference('onConfirm');
	if (typeof(f) == 'function') {
        try {
			var skipAppInstalls = true;
			if ($('cb'))
				skipAppInstalls = $('cb').checked;

			var dontDisplayAgain = false;
			if ($('dont_display_again'))
				dontDisplayAgain = $('dont_display_again').checked;

            f.call(gdw, gdw.getPreference('rus_sys_id'), skipAppInstalls, dontDisplayAgain);
        } catch(e) {
        }
    }
	gdw.destroy();
}

function cancel() {
	var gdw = GlideDialogWindow.get();
	gdw.destroy();
}
