function onLoad() {
    var func = g_form.getValue('function_name');
    func = func.toLowerCase();
    var list = $$('div[tab_caption="REST Message Function Parameter Definitions"]')[0];
    if (list.hasClassName('embedded'))
        if (func == 'get' || func == 'delete')
            list.show();
        else
            list.hide();
}
