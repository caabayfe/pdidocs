(function() {
    if (pm.isZboot())
        return;
    var gr = new GlideRecord('sys_properties');
    if (gr.get('fa94ecf7ff1032109557ffffffffffd0')) {
        gr.setValue('write_roles', 'admin');
        gr.update();
    }
})();
