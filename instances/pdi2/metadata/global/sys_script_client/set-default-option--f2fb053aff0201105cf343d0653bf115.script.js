function onLoad() {

    var alias = g_scratchpad.parent_connection_alias;
    if (alias) {
        var control = gel('sys_select.scheduled_import_set.connection_override');
        var option = control.querySelector('option[value="' + alias + '"]');
        option.innerText = getMessage("{0} (Default Connection)").withValues([option.innerText]);
    }

}
