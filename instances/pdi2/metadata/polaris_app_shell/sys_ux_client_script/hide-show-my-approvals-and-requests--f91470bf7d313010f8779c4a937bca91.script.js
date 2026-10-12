/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    if (api.data.data_row_evam_broker__my_approvals_1.output.evambroker.items && api.data.data_row_evam_broker__my_approvals_1.output.evambroker.items.length > 0){ 
        api.setState('hideMyApprovals', false);
        if (api.data.data_row_evam_broker__my_approvals_1.output.evambroker.items.length > 1) { 
            api.setState('hideMyApprovalsViewAll', false);
        }
    } else { 
        api.setState('hideTaskGraph', false);
        api.setState('hideMyApprovals', true);
    }

    if (api.data.data_row_evam_broker__my_requests_1.output.evambroker.items && api.data.data_row_evam_broker__my_requests_1.output.evambroker.items.length > 0){
        api.setState('hideMyRequests', false);
        if (api.data.data_row_evam_broker__my_requests_1.output.evambroker.items.length > 1) {
            api.setState('hideMyRequestsViewAll', false);
        }
    }

}
