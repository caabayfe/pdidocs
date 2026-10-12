var scriptActionId = "54bc0f700bb24210ff2a8a8db777b216";

disableBR();
function disableBR() {
	var gr = new GlideRecord("sys_script");
	if (gr.get("9d4dfa82b7c1421041c2feb0be11a95f")) {
		gr.setValue("active", false);
		gr.update();
	}

	gr = new GlideRecord("sysevent_script_action");
	if (gr.get(scriptActionId)) {
		gr.setValue("active", false);
		gr.update();
	}
}
