/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
	let subtabRoute = null;
	if (event.name === "NOTIFY_PARTICIPANTS_PAGE_BACK") {
		subtabRoute = "notify-call"
	}
    api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', {
        viewportElementId: "viewport_vnk",
		route: "collaborate-tab-subpage-snc-v2",
		fields: {
			table: api.context.props.parentTable,
			sysId: api.context.props.parentSysId
		},
		params: {
			subtabRoute: subtabRoute
		}
    });
}
