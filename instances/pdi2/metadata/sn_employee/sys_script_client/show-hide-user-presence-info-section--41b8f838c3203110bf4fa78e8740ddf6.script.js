function onLoad() {
    //Type appropriate comment here, and begin script below
    var selectEle = g_form.getOptionControl('channel');
    if (selectEle.options.length <= 1) {
        g_form.setSectionDisplay('user_presenceinfo', false);
    }
}
