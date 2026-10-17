	//The sys_ui_list is update sync custom, so the version and update have to be manually created.
	if (previous && previous != null) {
	var view = "Default view";
	if (previous.view && previous.view != null && previous.view.name && !gs.nil(previous.view.name))
		view = previous.view.name;
	var sf = new GlideSysForm(previous.name, view);
	sf.createDefaultBaselineVersion(previous);
}
