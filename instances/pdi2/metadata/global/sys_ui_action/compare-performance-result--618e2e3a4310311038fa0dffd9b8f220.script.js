function compare() {
    getMessage("ATF:compare_performance_result", function(msg) {
        var gm = new GlideModal('compare_performance_result');
        gm.setTitle(msg);
        gm.setPreference('sysparm_source_run', g_form.getUniqueValue());
        gm.render();
    });
}
