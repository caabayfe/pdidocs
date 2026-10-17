var table = current.name;
var dbObjectManager = new GlideDBObjectManager.get();
var baseTable = 'sys_metadata';
if (!dbObjectManager.isMetadataExtension(table))
	baseTable = dbObjectManager.getAbsoluteBase(table);

if (current.internal_type != 'collection') {
	gs.addErrorMessage(gs.getMessage('Updating "Text Index" field on non-collection types is not allowed. Please update it on root table {0} (type: Collection) or use ts_configuration table to configure text index instead.', [baseTable]));
	current.setAbortAction(true);

} else if (table != baseTable) {
	gs.addErrorMessage(gs.getMessage('The {0} table extends the {1} table. Please update the "Text Index" field on {2} to apply it to ALL tables that extend it.', [current.name, baseTable, baseTable]));
	current.setAbortAction(true);
}
