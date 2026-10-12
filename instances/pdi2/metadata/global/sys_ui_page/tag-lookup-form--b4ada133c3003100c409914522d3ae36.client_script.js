addLoadEvent(focusInput);

function invokePromptCallBack(type) {
    var gdw = GlideDialogWindow.get();
	var f;
    if (type == 'ok')
       f = gdw.getPreference('on_accept');
    if (typeof f == 'function') {
        try {
            f.call(gdw, gel('more_tags_lookup').value);
        } catch(e) {
        }
    }
    gdw.destroy();
    return false;
}

function focusInput() {
   var e = gel('sys_display.more_tags_lookup');
   Field.activate(e);
   triggerEvent(e, 'focus', true);
}
