function deleteSysOverridesFromPARComponent() {
    if (pm.isZboot())
        return;

    var gr = new GlideRecord("sys_dictionary");
    gr.addEncodedQuery('element=sys_overrides^name=par_component');
    gr.query();
    if (gr.next()) {
        var deleted = gr.deleteRecord();

        if (!deleted)
            gs.log("deleteSysOverridesFromPARComponent - failed to delete sys_overrides column in par_component table");
    }
}
deleteSysOverridesFromPARComponent();
