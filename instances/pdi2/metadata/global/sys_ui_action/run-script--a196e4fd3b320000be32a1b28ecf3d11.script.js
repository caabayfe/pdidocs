function showScriptBox() {
    var gb = new GlideOverlay("run_script");
    gb.setTitle("Run script");
    gb.setBodyFromForm('run_script');
    gb.render();
}

function runScript() {
    var script = gel('script_code').value;

    var ga = new GlideAjax('SysClusterAjax');
    ga.addParam('sysparm_name', 'runScript');
    ga.addParam('sysparm_script', script);
    ga.addParam('sysparm_node', g_form.getValue('system_id'));
    ga.getXML();
}
