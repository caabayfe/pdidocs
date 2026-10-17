// ArchiveTable creates new tables and maps if needed
var relatedRule = new GlideRecord('sys_archive');
relatedRule.addQuery('table', current.table);
relatedRule.query();
if (relatedRule.next()) {
    //This related record table has a rule associated, use it's retention policy
    new GlideArchiveTable().create(current.table, relatedRule.retain_references);
} else {
    //Use the current rule's retention policy
    var gr = new GlideRecord('sys_archive');
    if (gr.get(current.archive_map)) {
       new GlideArchiveTable().create(current.table, gr.retain_references);
    } else {
        new GlideArchiveTable().create(current.table);
    }
}
