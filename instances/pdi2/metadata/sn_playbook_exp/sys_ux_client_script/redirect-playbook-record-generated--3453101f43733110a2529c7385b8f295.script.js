/**
 * @param {params} params
 * @param {any} params.event
 * @param {any} params.helpers
 */
function handler({ event, helpers }) {
	const sysId = event?.payload?.sys_id || event?.payload?.sysId;
	const table = event?.payload?.table;

	if (!sysId || !table) return;

	// Doing this in helpers.timing.setTimeout so we can get access to the
	// URL the client script is running on
	helpers.timing.setTimeout(function () {
		const screenParams = { table, sysId };

		const url = this.document.URL;

		// Only do this is optional page params exist in the URL
		// And table and sysId are in the URL
		if (
			url &&
			url.includes('params') &&
			url.includes('table') &&
			(url.includes('sys-id') || url.includes('sysId'))
		) {
			helpers?.navigate?.setRouteParams({
				params: { ...screenParams }
			});
			return;
		}

		// Otherwise attempt to call the updateStatus method with screenParams
		helpers?.screen?.updateStatus({ screenParams });
	});
}
