function onChange(control, oldValue, newValue) {

    var script = g_form.getValue('script');

    var isMine = false;
    if (script == template_onChange)
        isMine = true;
    if (script == template_onLoad)
        isMine = true;
    if (script == template_onSubmit)
        isMine = true;
    if (script == template_onCellEdit)
        isMine = true;
    if (script == '')
        isMine = true;

    if (!isMine)
        return;

    if (newValue.indexOf('Change') > -1)
        script = template_onChange;
    if (newValue.indexOf('Load') > -1)
        script = template_onLoad;
    if (newValue.indexOf('Submit') > -1)
        script = template_onSubmit;
    if (newValue.indexOf('Cell') > -1)
        script = template_onCellEdit;

    g_form.setValue('script', script);
}

var template_onChange = "function onChange(control, oldValue, newValue, isLoading) {}";
var template_onLoad = "function onLoad() {}";
var template_onCellEdit = "function onCellEdit(sysIDs, table, oldValues, newValue, callback) {}";
var template_onSubmit = "function onSubmit() {}";
