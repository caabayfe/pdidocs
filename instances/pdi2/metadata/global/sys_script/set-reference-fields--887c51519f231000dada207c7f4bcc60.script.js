var ref = current.reference.split('.');
current.table = ref[0];
current.element = ref[1];
var td = GlideTableDescriptor.get(current.table);
var overridedTables = gs.getProperty('glide.db.archive.no.archive.override');
if (td.getED().getBooleanAttribute('no_archive') && (!overridedTables.includes(table))) {
    gs.addErrorMessage(gs.getMessage("Invalid 'Reference table' selected on the Archive Related Records record. The '{0}' table is excluded from archiving", [current.table]));
    current.setAbortAction(true);
}
