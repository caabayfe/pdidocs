function onLoad() {
    var FORM_MODEL = '360935e9534723003eddddeeff7b127d';
    var LAYOUT_ITEMS_REL = 'REL:7ff743ae53913110c6a2ddeeff7b1220';
    var ACTION_LAYOUT_REL = 'REL:288d57aa53153110c6a2ddeeff7b123b';
    var model = g_form.getValue('model');
    if (model !== FORM_MODEL) {
        g_form.hideRelatedList(LAYOUT_ITEMS_REL);
        g_form.hideRelatedList(ACTION_LAYOUT_REL);
    }
}
