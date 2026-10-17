/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
	helpers.timing.setTimeout(function() {
		const polarisProperty = this.ux_globals.sysprops['glide.ui.polaris.experience'];
        const polarisUserPref = this.ux_globals.userPrefs['glide.ui.polaris.use'];
        const isPolarisDisabled = !(
           polarisProperty.toString().toLowerCase() === 'true' &&
           polarisUserPref === 'true'
        );

		const {getPayload} = imports['sn_app_analytics_w.ParWidgetsDrilldowns']();	
    	const payload = getPayload(event, isPolarisDisabled, this);	
		api.emit('NAV_ITEM_SELECTED', payload);
	});
}
