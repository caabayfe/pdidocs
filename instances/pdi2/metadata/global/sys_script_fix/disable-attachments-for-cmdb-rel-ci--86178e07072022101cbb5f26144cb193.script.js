if (!pm.isZboot()) {
    gs.info("Fix Script: Started disabling attachments for cmdb_rel_ci table.");

    var gr = new GlideRecord("sys_attachment");
    gr.addQuery("table_name", "cmdb_rel_ci");
    gr.setLimit(1);
    gr.query();

    if (gr.next()) {
        gs.info("Customer has sys_attachment rows for table cmdb_rel_ci. Skipping cmdb_rel_ci dictionary updates.");
    } else {
        gs.info("Customer has no sys_attachment rows for table cmdb_rel_ci. Applying 'no_attachment' and 'no_attachments' attributes to cmdb_rel_ci dictionary entry.");
        SNC.DictionaryAttribute.set('cmdb_rel_ci', '', 'no_attachment', 'true');
        SNC.DictionaryAttribute.set('cmdb_rel_ci', '', 'no_attachments', 'true');
    }

    gs.info("Fix Script: Finished disabling attachments for cmdb_rel_ci table.");
}
