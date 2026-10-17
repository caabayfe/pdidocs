var sysId = g_form.getUniqueValue();
var tableName = g_form.getTableName();
function ChooseTemplate() {
	if(typeof g_envMeta !== 'undefined' && g_envMeta.getEnvironment() === 'jelly') {
		var url = top.location.href;
		if (url.indexOf("nav_to.do") == -1 && !isPolaris()) {
			var dialogClass = GlideModal ? GlideModal : GlideDialogWindow;
			var dialog = new dialogClass('sn_templated_snip_message_template');
			dialog.setTitle(getMessage('Response Templates'));
			dialog.setPreference('sysparm_sys_id', sysId);
			dialog.setPreference('sysparm_table_name', tableName);
			dialog.render();
		} else {
			var fireFn = CustomEvent.fireTop;
			if (window.NOW.isPolarisEnabled === 'true')
				fireFn = CustomEvent.fire;

			fireFn('sn:hr_trigger_sidebar', {sysId: sysId, tableName: tableName});
		}
	} else {
		g_modal.showWidget({
			tagName: 'sn-templated-snip-message-template-widget',
			title: 'Responses - Test',
			size: 'lg',
			props: { 'tableName': tableName, 'recordSysId': sysId }
		})
	}
}

// Close sidebar when page changes
if (window) {
	window.onbeforeunload = function() {
		var fireFn = CustomEvent.fireTop;
		if (window.NOW.isPolarisEnabled === 'true')
			fireFn = CustomEvent.fire;

		fireFn('sn:hr_sidebar_collapse');
	};
}
