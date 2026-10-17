function onLoad() {
    var gr = new GlideRecord('cmdb_identifier_entry');
    gr.addQuery('identifier', g_form.getUniqueValue());
    gr.query();
    if (gr.next())
        g_form.setReadOnly('applies_to', true);
}
