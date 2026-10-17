var payload = {
		isMaint: gs.hasRole('maint'),
		type: 'experience',
		experienceId: request.pathParams?.experienceId ?? ""
	};
gs.eventQueue('sn_uibtk_api.builderassistant.bg.job', null, JSON.stringify(payload));
