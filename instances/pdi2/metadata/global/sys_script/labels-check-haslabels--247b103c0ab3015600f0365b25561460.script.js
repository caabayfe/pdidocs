var HAS_LABELS = 'hasLabels';
addAttr();

function addAttr() {
    if (!current.table)
        return;

    var td = GlideTableDescriptor.get(current.table);
    if (!td)
        return;

    var hasAttr = td.getED().getBooleanAttribute(HAS_LABELS);
    if (hasAttr)
        return;

    var ed = td.getED();
    GlideBootstrap.mergeTableAttributes(ed, HAS_LABELS);
    GlideTableManager.invalidateTable(current.table);
    gs.log('Set "hasLabels" attribute on table ' + current.table);
}
