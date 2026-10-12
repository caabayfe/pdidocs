var gr = new GlideRecord('cmdb_identifier');
gr.query();
while (gr.next()) {
    if (!GlideTableDescriptor.isValid(gr.getValue('applies_to'))) {
        gr.deleteRecord();
    }
}
