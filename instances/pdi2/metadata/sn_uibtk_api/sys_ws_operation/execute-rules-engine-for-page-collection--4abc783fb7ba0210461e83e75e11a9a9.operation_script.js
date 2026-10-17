var payload = {
		isMaint: gs.hasRole('maint'),
		type: 'pc',
		extensionPointId: request.pathParams?.extensionPointId ?? ""
	};
gs.eventQueue('sn_uibtk_api.builderassistant.bg.job', null, JSON.stringify(payload));
