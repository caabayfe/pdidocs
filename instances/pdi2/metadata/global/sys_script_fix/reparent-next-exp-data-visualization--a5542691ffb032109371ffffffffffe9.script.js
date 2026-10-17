gs.info('Started running fix script - Reparent next exp data visualization');
try {

    // Set table hierarchy editor property value to false if not already
    var TABLE_HIERARCHY_EDITOR_LIVE = "glide.db.table.hierarchy_editor.live";
    var useLiveReparentingProp = gs.getProperty(TABLE_HIERARCHY_EDITOR_LIVE, "true");
    var isTableHierarchyEditorLive = useLiveReparentingProp === "true";
    if (isTableHierarchyEditorLive) {
        gs.info("Setting the property: " + TABLE_HIERARCHY_EDITOR_LIVE + " value to: false");
        GlideProperties.set(TABLE_HIERARCHY_EDITOR_LIVE, "false");
    }

    var helper = new AnalyticsCenterUpgradeHelper();
    helper.runVisualizationReparenting();

    // Create sys_trigger entry to run data migration run once on load
    var gr = new GlideRecord('sys_trigger');
    gr.setValue('name', 'Migrate analytics center data run once');
    gr.setValue('job_id', '307a3d68ff0132109371ffffffffff84');
    gr.setValue('trigger_type', '0');

    var gdt = new GlideDateTime();
    gdt.addSeconds(10);

    gr.setValue('next_action', gdt.getValue());
    gr.insert();
} catch (e) {
    gs.info("Unable to reparent par_visualization table");
    gs.error(e);
} finally {
    // Reset table hierarchy editor property value
    if (isTableHierarchyEditorLive) {
        GlideProperties.set(TABLE_HIERARCHY_EDITOR_LIVE, isTableHierarchyEditorLive + '');
        gs.info("Setting the property: " + TABLE_HIERARCHY_EDITOR_LIVE + " value to: " + isTableHierarchyEditorLive);
    }
}

gs.info('Finished running fix script - Reparent next exp data visualization');
