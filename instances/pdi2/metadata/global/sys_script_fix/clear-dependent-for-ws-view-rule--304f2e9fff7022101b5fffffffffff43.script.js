// --- clear value of a field in a glide record
// --- but only if current value matches ifValue
function clearField(gr, fieldName, ifValue) {
    if (ifValue == gr.getValue(fieldName))
        gr.setValue(fieldName, '');
}

// --- only runs on instance upgrade, not on zboot
if (!pm.isZboot()) {
    // --- retrieve definition of field 'view'
    // --- for table sysrule_view_workspace
    var gr = new GlideRecord('sys_dictionary');
    gr.addQuery('element', 'view');
    gr.addQuery('name', 'sysrule_view_workspace');
    gr.setLimit(1);
    gr.query();

    if (gr.next()) {
        var existingValue = 'table';
        clearField(gr, 'dependent', existingValue);
        clearField(gr, 'dependent_on_field', existingValue);

        if (gr.changes()) {
            gr.setWorkFlow(false);
            gr.setUseEngines(false);
            gr.update();
            gs.info("msg='sysrule_view_workspace.view dependency on table removed' fix_script=304f2e9fff7022101b5fffffffffff43");
        }
    }
}
