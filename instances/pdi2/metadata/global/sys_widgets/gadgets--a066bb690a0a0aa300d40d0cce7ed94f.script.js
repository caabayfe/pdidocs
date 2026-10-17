function sections() {
    return {
              'Sticky Note' : { 'type' : 'sticky', 'content' : 'Default sticky note text here.' },
              'System Information' : {
                  'Overview' : { 'type' : 'system', 'action' : 'overview' },
                  'Last Upgrade' : { 'type' : 'system', 'action' : 'upgrade_history' }
              },
              'Priority 1 Incidents' : { 'type' : 'priority_incidents' },
              'Priority 1 Problems' : { 'type' : 'priority_problems' },
              'Emergency Changes' : { 'type' : 'emergency_changes' }
    };
}

function render() {
	var type = renderer.getPreferences().get("type");
        var gf = new GlideForm(renderer.getGC(), "render_gadget_" + type, 0);
        gf.setDirect(true);
        gf.setRenderProperties(renderer.getRenderProperties());
        return gf.getRenderedPage();
}

function getEditLink() {
		if (!gs.hasRole('admin'))
            return '';

        return "sys_ui_page.do?sysparm_query=name=render_gadget_" + renderer.getPreferences().get("type"); 
}
