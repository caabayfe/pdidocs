(function executeRule(current, previous /*null when async*/) {
    // fetch the branding record and clear out the va_logo field
    var gr = new GlideRecord("sys_cs_branding_setup");
    if (gr.get(current.table_sys_id)) {
        // ensure this is the exact same attachment being deleted
        if (gr.getValue('va_logo') == current.sys_id) {
            gr.setValue('va_logo', '');
            gr.update();
        }
    }
})(current, previous);
