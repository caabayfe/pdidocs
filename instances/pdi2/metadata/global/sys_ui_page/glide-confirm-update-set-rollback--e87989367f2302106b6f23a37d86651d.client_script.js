function invokePromptCallBack(type) {
	var f;
    var gdw = GlideDialogWindow.get();
    if (type == 'ok')
        f = gdw.getPreference('onPromptComplete');
    else
        f = gdw.getPreference('onPromptCancel');
    if (typeof(f) == 'function') {
        try {
			var rollbackContextId = null;
			if ($('rcid'))
				rollbackContextId = $('rcid').value;			
			// passed the rollback context id to the callback
            f.call(gdw, rollbackContextId);
        } catch(e) {
        }
    }
    gdw.destroy();
    return false;
}

// GlideModal and GlideDialogWindow both put the footer inside the body, which messes up the
// formatting. This code moves the footer to be a sibling of the body, which renders correctly
var to_move_up = $('to_move_up');
var oldParent = to_move_up.parentNode;
oldParent.removeChild(to_move_up);
oldParent.parentNode.parentNode.insert(to_move_up);

var gdw = GlideDialogWindow.get();
var focusButton = gdw.getPreference('defaultButton');
if (focusButton == null)
	focusButton = 'cancel_button';
gel(focusButton).focus();
