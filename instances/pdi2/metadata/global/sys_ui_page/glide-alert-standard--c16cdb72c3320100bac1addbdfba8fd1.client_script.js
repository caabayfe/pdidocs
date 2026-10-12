function invokePromptCallBack() {
    var gdw = GlideDialogWindow.get();
    gdw.destroy();
    return false;
}

var gdw = GlideDialogWindow.get();
gel('ok_button').focus();
