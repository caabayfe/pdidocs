async function script({ helpers , api}) {

	await helpers.copyUrlToClipboard()

	function dispatchAriaLiveMsg(message) {
		api.emit("SEISMIC_ARIA_LIVE_REGION_UPDATE_REQUESTED",
			{
				message,
				type: 'polite'
			}
		);
	}

	helpers.timing.setTimeout(async function() {
		const url = await this.navigator.clipboard.readText();
		if(url) {
			const header = await helpers.translate('Link copied.');
			const content = await helpers.translate(
				'This link includes all your recent edits to the current view.'
			);
			api.emit('LIST_CTRL#ADD_NOTIFICATIONS', {
				items: [
					{
						status: 'positive',
						icon: 'check-circle-outline',
						header,
						content: {
							type: 'string',
							value: content,
						},
						action: { type: 'dismiss' },
						id: `now_alert_copied_url:${url}`,
						enableFocus: true,
					},
				],
			});
			dispatchAriaLiveMsg([header, content].join(' '));
		} else {
		 const content = await helpers.translate(
			'Error copying the link to the clipboard.'
		);
			api.emit('LIST_CTRL#ADD_NOTIFICATIONS', {
				items: [
					{
						status: 'critical',
						content,
						action: {
							type: 'dismiss',
						},
						id: `now_alert_copied_url_error:${url}`,
						enableFocus: true,
					},
				],
			});
			dispatchAriaLiveMsg(content);
		}
	})
}
