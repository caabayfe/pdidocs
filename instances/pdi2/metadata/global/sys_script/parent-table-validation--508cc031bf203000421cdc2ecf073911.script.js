// has table parent record and processing a table insert
// so check if this record has a nil element value, if so abort insertion of this field record
if(current.element.nil()) {
    current.setAbortAction(true);
    current.element.setError(gs.getMessage("Column name cannot be empty for fields."));
    gs.addErrorMessage(gs.getMessage("Column name cannot be empty for fields."));
} else {
    // now check if table already exists, if so abort insertion of this field record
    var table = new GlideRecord(parent.getTableName());
    table.addQuery('name', parent.name);
    table.query();
    if(table.next()) {
        // table being inserted as part of this field insert already exists,
        // so do not insert the field records.  Subsequent business rules on
        // sys_db_object will generate the appropriate messages for this error.
        current.setAbortAction(true);
    }
}
