var AddAppInstallDialog = Class.create({
	exit: function() {
		GlideDialogWindow.get().destroy();
	},

	addApp: function() {
		var appsToAdd = document.getElementById("appsToAdd").getElementsByTagName("li");
		var sysIds = [];
		for (var i = 0; i < appsToAdd.length; i++) {
			sysIds.push(appsToAdd[i].id);
		}

		var table = "${JS:sysparm_table}";
		var ga = new GlideAjax("AppUnloader");
		ga.addParam("sysparm_name", "addApps");
		ga.addParam("sysparm_sys_ids", sysIds);
		ga.addParam("sysparm_table", table);
		ga.getXMLWait();
		var success = ga.getAnswer();
		var gm = new GlideModal();
		if (success) {
			gm.setTitle("Success");
			gm.renderWithContent("App installs added to the current update set");
		} else {
			gm.setTitle("Failure");
			gm.renderWithContent("App installs were not added to the current update set");
		}
	}
});

var gAddAppInstall = new AddAppInstallDialog();
