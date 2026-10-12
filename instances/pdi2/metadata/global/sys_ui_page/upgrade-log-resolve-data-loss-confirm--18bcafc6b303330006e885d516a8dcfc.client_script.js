function cancel() {
	invokePromptCallBack('cancel');
	destroyDialog();
    return false;
}

function okToDestroyData() {
	invokePromptCallBack('ok');
	destroyDialog();
	return true;
}
		
function destroyDialog() {
	GlideDialogWindow.get().destroy();
}

function invokePromptCallBack(type) {
    var gdw = GlideDialogWindow.get();
    if (type == 'ok')
        var f = gdw.getPreference('onPromptComplete');
    else
        var f = gdw.getPreference('onPromptCancel');
    if (typeof(f) == 'function') {
        try {
            f.call(gdw, gdw.getPreference('oldValue'));
        } catch(e) {
        }
    }
    return false;
}

// GlideModal and GlideDialogWindow both put the footer inside the body, which messes up the
// formatting. This code moves the footer to be a sibling of the body, which renders correctly
var to_move_up = $('to_move_up');
var oldParent = to_move_up.parentNode;
oldParent.removeChild(to_move_up);
oldParent.parentNode.parentNode.insert(to_move_up);
