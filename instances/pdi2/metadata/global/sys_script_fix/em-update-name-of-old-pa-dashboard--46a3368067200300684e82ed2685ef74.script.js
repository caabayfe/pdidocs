function changeDashboardName() {
	var gr = new GlideRecord("pa_dashboards");
	var EM_OLD_DASHBOARD_SYS_ID = "026e3de6d7401200eaae68150e61030c";
	if (gr.get(EM_OLD_DASHBOARD_SYS_ID)) {
		gr.setValue("name", "Event Management - Deprecated");
		gr.update();
		gs.log("Finish updating the name od the old EM dashboard");
	}
}

changeDashboardName();
