function invokePromptCallBack() {
    var gdw = GlideModal.get();
    var f = gdw.getPreference('onPromptComplete');
    if (typeof(f) == 'function') {
        try {
            f.call(gdw, gdw.getPreference('oldValue'));
        } catch(e) {
        }
    }
    gdw.destroy();
    return false;
}
