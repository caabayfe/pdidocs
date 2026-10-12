addLoadEvent(focusInput);

function invokePromptCallBack(type) {
    var gdw = GlideDialogWindow.get();
    if (type == 'ok')
       var f = gdw.getPreference('onPromptComplete');
    else
       var f = gdw.getPreference('onPromptCancel');
    if (typeof(f) == 'function') {
        try {
            f.call(gdw, gel('glide_prompt_answer').value);
        } catch(e) {
        }
    }
    gdw.destroy();
    return false;
}

function focusInput() {
   var e = gel('glide_prompt_answer');
   Field.activate(e);
   triggerEvent(e, 'focus', true);
}
