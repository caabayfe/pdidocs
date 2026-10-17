function invokePromptCallBack(type) {
    var gdw = GlideDialogWindow.get();
    if (type == 'ok')
        var f = gdw.getPreference('onPromptComplete');
    else
        f = gdw.getPreference('onPromptCancel');
    if (typeof(f) == 'function') {
        try {
            f.call(gdw, gdw.getPreference('oldValue'));
        } catch (e) {}
    }
    gdw.destroy();
    return false;
}

function openDocs() {
    var gdw = GlideDialogWindow.get();
    var help_url = gdw.getPreference('doc_url');
    window.open(help_url, '_blank');
    gdw.destroy();
    return false;
}

var gdw = GlideDialogWindow.get();
var focusButton = gdw.getPreference('defaultButton');
if (focusButton == null)
    focusButton = 'cancel_button';
