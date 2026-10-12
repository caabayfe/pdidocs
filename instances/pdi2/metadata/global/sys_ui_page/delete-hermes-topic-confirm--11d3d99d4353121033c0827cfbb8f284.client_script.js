function invokePromptCallBack(type) {
    var gdw = GlideDialogWindow.get();
    var f;
    if (type == 'ok')
        f = gdw.getPreference('onPromptComplete');
    else
        f = gdw.getPreference('onPromptCancel');
    if (typeof(f) == 'function') {
        f.call(gdw, gdw.getPreference('oldValue'));
    }
    gdw.destroy();
}
