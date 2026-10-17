/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    const action = event.payload.action;
    
    switch (action.prominType) {
        case 'refresh':
            api.data.fetch_promin_ad_state_1.refresh();
            break;
        case 'open-config':
            // Using the navigate helper to go to that page
			helpers.navigate.to(undefined, undefined, {}, false, false, null, {
                url: '/nav_to.do?uri=%2Fpromin_process_def_list.do'
            });
            break;
        case 'resubmit':
            api.data.start_promin_ad_1.execute({
                versionId: api.context.props.versionId,
            });
            break;
    }
}
