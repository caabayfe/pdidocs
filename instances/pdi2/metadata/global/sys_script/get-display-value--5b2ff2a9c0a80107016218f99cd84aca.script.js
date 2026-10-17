function getDisplayValueOf(tableName, sys_id) {
    var td = GlideTableDescriptor.get(tableName);
    if (!td.isValid())
        return '';

    var dn = td.getDisplayName();

    var gr = new GlideRecord(tableName);
    gr.get(sys_id);
    var de = gr[dn];
    if (!de)
        return '';

    if (RhinoEnvironment.useSandbox() && !de.canRead())
        return '';

    return de.getDisplayValue();
}
