// delete any databases that use this definition since it has changed
var gr = new GlideRecord('jrobin_database');
gr.addQuery('definition', current.sys_id);
gr.query();
gs.print("Jrobin Definition modified: " + current.getUniqueValue() + " Deleting jrobin databases: " + gr.getRowCount());
gr.deleteMultiple();
