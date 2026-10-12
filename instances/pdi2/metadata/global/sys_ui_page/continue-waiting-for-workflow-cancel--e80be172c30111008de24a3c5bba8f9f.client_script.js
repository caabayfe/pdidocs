function invokePromptCallBack(type) {
    var gdw = GlideDialogWindow.get();
    if (type == 'kill')
        var f = gdw.getPreference('onPromptComplete');
    else
        var f = gdw.getPreference('onPromptCancel');
    if (typeof(f) == 'function') {
        try {
            f.call(gdw, gdw.getPreference('oldValue'));
        } catch(e) {
        }
    }
    gdw.destroy();
    return false;
}

var gdw = GlideDialogWindow.get();
var focusButton = gdw.getPreference('defaultButton');
if (focusButton == null)
	focusButton = 'cancel_button';

gel(focusButton).focus();
