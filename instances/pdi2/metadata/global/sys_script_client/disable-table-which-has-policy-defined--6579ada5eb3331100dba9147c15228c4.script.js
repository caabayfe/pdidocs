function onLoad() {
    var sel = g_form.getElement('tablename');
    for (var i = 0, n = sel.options.length; i < n; i++) {
        var table = sel.options[i].value;
      
        if (g_scratchpad.has_policy_defined_tables.includes(table))
            sel.options[i].disabled = true;
    }
}
