(function executeRule(current, previous /*null when async*/ ) {
    var wcu = new WorkspaceCompilerUtils();

    deleteModules();
    deletePageRegistry();

    function deleteModules() {
        var gr = GlideRecord('sys_aw_module');

        gr.addQuery('workspace_config', current.getUniqueValue());
        gr.query();

        while (gr.next()) {
            wcu.deleteAllContentExtensions(gr);
            gr.deleteRecord();
        }
    }

    function deletePageRegistry() {
        var gr = GlideRecord('sys_ux_page_registry');

        if (gr.get(current.compiled_page_registry)) {
            gr.deleteRecord();
        }
    }
})(current, previous);
