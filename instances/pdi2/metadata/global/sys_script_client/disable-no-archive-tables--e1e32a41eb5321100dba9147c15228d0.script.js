function onLoad() {

    var sel = g_form.getElement('reference');

    for (var i = 0, n = sel.options.length; i < n; i++) {

        var ref = sel.options[i].value.split('.');
        var table = ref[0];

        if (g_scratchpad.no_archive_tables.includes(table))
            sel.options[i].disabled = true;
    }
}
