function dismissModalDialog() {
  setTimeout(function() {
    var modal = GlideModal.prototype.get("on_call_who_and_escalation");
	  modal.destroy();
  }, 0);
}

function isModalOutOfViewport (el) {
	if (el && (el.width() + el.offset().left) > this.window.innerWidth)
		return true;
	return false;
}

function showDialog() {
	var modal = new GlideModal("on_call_who_and_escalation");
	ScriptLoader.getScripts('/scripts/incident/glide_custom_modal_accessibility.js', function() {
		var url = "/$on_call_who_and_escalation.do?sysparm_full_webrtc=true&sysparm_group_id=";
		url = url + g_form.getValue('assignment_group');
		url = url + '&sysparm_task_table=' + g_form.getTableName();
		url = url + '&sysparm_task_sys_id=' + g_form.getUniqueValue();
		url = url + "&sysparm_stack=no";
		modal.template = glideCustomModalTemplate;
		modal.setWidth(807);
		modal.renderIframe(url, function() {
			var modalContainer = this.parent.jQuery('#on_call_who_and_escalation');
			modalContainer.find(".modal-dialog").width("800");
			modalContainer.find(".modal-content").height("625");
			modalContainer.find("iframe").height("625");
			
			var modalDialogEl = modalContainer.find(".modal-dialog");
			if (isModalOutOfViewport(modalDialogEl)) {
				modalContainer.css({
					"overflow-x": "scroll"
				});
			}
			this.parent.jQuery('#on_call_who_and_escalation .modal-body > div').css({"top": "0", "bottom": "0", "left": "0", "right": "0"});
		});
		window.NOW.CustomEvent.observe("DismissOCGlideModal", dismissModalDialog);
	});
}
