function onLoad() {
    if (g_form.getValue('cube') == '') return;

	  g_form.getReference('cube', function(c) {
        g_form.setValue('facts_table', c.facts_table);
    });
}
