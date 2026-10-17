function invokePromptCallBack(type) {
    var gdw = GlideDialogWindow.get();
    if (type == 'ok')
        var f = gdw.getPreference('onPromptClose');
    
    if (typeof(f) == 'function') {
        try {
            f.call(gdw);
        } catch(e) {
        }
    }
    gdw.destroy();
    return false;
}

var gdw = GlideDialogWindow.get();
gel("close_button").focus();
