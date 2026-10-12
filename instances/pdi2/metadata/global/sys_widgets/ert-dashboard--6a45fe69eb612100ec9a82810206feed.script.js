function sections() {
    return {
        'Outlier Finished Workflows for ERT (Percentage Outlier)' : { 'type' : 'wf_finished_ert' }, // references UI Page 'render_gadg//et_ert_parameters'
        'Outlier Long Running Workflows for ERT (Percentage Outlier)' : { 'type' : 'wf_running_ert' }
    };
}

function render() {
    var type = renderer.getPreferences().get("type")
    var gf = new GlideForm(renderer.getGC(), "render_gadget_" + type, 0);
    gf.setDirect(true);
    gf.setRenderProperties(renderer.getRenderProperties());
    return gf.getRenderedPage();
}

function getEditLink() {
        if (gs.hasRole('admin') || gs.hasRole('workflow_admin'))
            return "sys_ui_page.do?sysparm_query=name=render_gadget_" + renderer.getPreferences().get("type");

        return ''; 
}
