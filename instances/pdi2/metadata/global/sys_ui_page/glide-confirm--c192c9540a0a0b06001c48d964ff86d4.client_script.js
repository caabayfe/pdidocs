function invokeConfirmCallBack(type) {
    var gdw = GlideDialogWindow.get();
    if (type == 'save')
       var f = gdw.getPreference('onPromptSave');
    else if (type == 'discard')
       var f = gdw.getPreference('onPromptDiscard');
    else
       var f = gdw.getPreference('onPromptCancel');
    if (typeof(f) == 'function') {
        try {
            f.call(gdw, type);
        } catch(e) {
        }
    }
    gdw.destroy();
    return false;
}
