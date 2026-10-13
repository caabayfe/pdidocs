function onLoad() {
	var fieldName = g_form.removeCurrentPrefix("discover");
	var control = g_form.getControl("discover");
	if (control && !control.options) {
		var name = 'sys_select.' + this.tableName + '.' + fieldName;
		//'gel' is simply a shortcut for 'document.getElementById'
		control = gel(name);
	}
	if (!control && !control.options && !control.options.length)
		return;

	var discoveryTypeOptions = control.options;
	for (var i = 0; i < discoveryTypeOptions.length; i++) {
		if (discoveryTypeOptions[i].value == "Cloud Resources") {
			discoveryTypeOptions[i].disabled = 'true';
			break;
		}
	}	
}
