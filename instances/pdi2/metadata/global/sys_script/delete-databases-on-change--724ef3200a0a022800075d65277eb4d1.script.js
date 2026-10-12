// delete any databases that use this definition since it has changed
var gr = new GlideRecord('jrobin_database');
gr.addQuery('definition', current.jrobin_definition);
gr.query();
gs.print("Jrobin datasource modified: " + current.getUniqueValue() + " Deleting jrobin databases: " + gr.getRowCount());
gr.deleteMultiple();
