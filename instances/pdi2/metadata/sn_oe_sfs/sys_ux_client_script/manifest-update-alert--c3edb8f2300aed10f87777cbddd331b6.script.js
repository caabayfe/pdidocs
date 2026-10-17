/**
	* @param {params} params
	* @param {api} params.api
	* @param {any} params.event
	* @param {any} params.imports
	* @param {ApiHelpers} params.helpers
	*/
	function handler({api, event, helpers, imports}) {
		helpers.snHttp(`/api/sn_va_teams/manifest_generation_ui/checkForManifestChanges/${encodeURIComponent(api.data.look_up_bot_id.results[0].bot_id.value)}`, {method: 'GET'})
				.then(({response}) => {
					if(response.result){
						api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
							items: [{
								id: 'manifest update alert',
								status: 'high',
								icon: 'circle-info-outline',
								content: 'Message extension feature added. Check the box to enable it.',
								action: {type: 'dismiss'}
							}]
						});
					}
				});
	}
	
