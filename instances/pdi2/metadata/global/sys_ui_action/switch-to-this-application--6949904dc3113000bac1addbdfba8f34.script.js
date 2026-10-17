function changeCurrentApplication() {
	if (typeof rowSysId == 'undefined')
		sysId = gel('sys_uniqueValue').value;
	else
		sysId = rowSysId;
	
	jQuery.ajax('/api/now/ui/concoursepicker/application',
	{
		method: "GET",
		headers: {
			'X-UserToken': g_ck,
		}
	})
	.done(function checkIfScopeAccessIsAllowed(response) {
		if (!(response && response.result && response.result.list && Array.isArray(response.result.list))) {
			return;
		}
		
		var canUserSwitchToScope = response.result.list
		.some(function matchesApprovedScope(scope) {
			return scope.sysId.localeCompare(sysId) === 0;
		});
		if(!canUserSwitchToScope) {
			g_GlideUI.addOutputMessage({
				'msg': new GwtMessage().getMessage('Not allowed to switch to this application scope.'),
				'type': 'error'
			});
			return;
		}
		
		var ajax = new GlideAjax("com.snc.apps.AppsAjaxProcessor");
		ajax.addParam("sysparm_function", "changeApplication");
		ajax.addParam("sysparm_value", sysId);
		ajax.getXML(changeApplicationResponse);
	})
	.fail(function informOfScopeAccessCheckError(jqXHR, textStatus, error) {
		g_GlideUI.addOutputMessage({
			'msg': new GwtMessage().getMessage('Failed to determine if application scope is accessible. HTTP Status {0}: {1}', jqXHR.status, error),
			'type': 'error'
		});
	})
	;

	function changeApplicationResponse() {
		// in List v3, we are in UI16, so the picker refreshes automatically
		if (g_api == 2)
			return;
		
		var picker = getTopWindow().g_application_picker;
		if (picker) {
			picker.select.options.length = 0;
			picker.fillApplications();
		}
		window.location.reload();
	}
}
