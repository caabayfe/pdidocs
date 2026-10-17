function onLoad() {

	if (top.workflowDiagram && top.workflowDiagram.dialog) {
		jQuery("nav.section_zero").find("button").each(function(i,e) {
			var btn = jQuery(e);
			var btnid = btn.prop("id");
			if (btnid !== 'sysverb_insert' && btnid !== 'sysverb_update') 
				btn.hide();
		});
		jQuery("button#togglePersonalizeForm").remove();
	}

	// resize when from inside popup ref picker
	if (isReferencePopup()) {
		window.moveBy(0, -180);
		window.resizeTo(1200, 800);
	}

	g_form.setSectionDisplay("stages", false);

	function isReferencePopup() {
		var gURL = new GlideURL();
		gURL.setFromCurrent();
		var refUrl = gURL.getParam("sysparm_referring_url");
		if (refUrl)
			return true;
		return false;
	}
}
