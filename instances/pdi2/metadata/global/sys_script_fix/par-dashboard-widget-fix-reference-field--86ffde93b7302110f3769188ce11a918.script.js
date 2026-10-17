gs.info('par_dashboard_widget - Update reference field table of par_dashboard_widget.component to sys_ux_lib_component. Start');
updateReferenceFieldTable();
updateReferenceFieldLabel();
gs.info('par_dashboards_widget - Update reference field table of par_dashboard_widget.component to sys_ux_lib_component. End');

function updateReferenceFieldTable(){
	if (pm.isZboot())
		return;

	var gr = new GlideRecord("sys_dictionary");
	gr.addQuery("name", "par_dashboard_widget");
	gr.addQuery("element", "component");
	gr.query();
	if (gr.next()) {
		gr.setValue("reference","sys_ux_macroponent");
		gr.setValue('column_label','Macroponent');
		if (!gr.update())
			gs.log("par_dashboards_widget - failed to update reference table of par_dashboard_widget.component field");
		gs.log("par_dashboards_widget - Success. Reference table of par_dashboard_widget.component set to sys_ux_macroponent");
	}

	gs.info('par_dashboards Update reference field table of par_dashboard_widget.component to sys_ux_macroponent. End');
}

function updateReferenceFieldLabel(){
	if (pm.isZboot())
		return;

	var gr = new GlideRecord("sys_documentation");
	gr.addQuery("name", "par_dashboard_widget");
	gr.addQuery("element","component");
	gr.query();
	if(gr.next()){
		gr.setValue("label","Macroponent");
		gr.setValue("plural","Macroponents");
		if (!gr.update())
			gs.log("par_dashboards_widget - failed to update label par_dashboard_widget.component field on sys_documentation table");
		
	}

}
