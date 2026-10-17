/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/ 
async function handler({api, event, helpers, imports}) {
    const { POLICY_NOTIFICATION_MSG_CODES } = imports["sn_cmdb_ws.DataManagerNotificationUtil"]();
    const isDeletePoliciesActionScheduled = event.payload.data?.output?.isDeletePoliciesActionScheduled;

    api.setState("policiesListRefresh", { timestamp: new Date() });

    if (api.context.props.subSelectedTabIndex == "1") { // Draft policies
        helpers.navigate.setRouteParams({'params': {showNotification: isDeletePoliciesActionScheduled === true ?
                POLICY_NOTIFICATION_MSG_CODES.DELETE_DRAFT_POLICIES_ACTION_SCHEDULED:
                POLICY_NOTIFICATION_MSG_CODES.DELETE_DRAFT_POLICIES_SUCCESS, ts: Date.now()}});
    } else if (api.context.props.subSelectedTabIndex == "2") { // De-activated polices
        helpers.navigate.setRouteParams({'params': {showNotification: isDeletePoliciesActionScheduled === true ?
                POLICY_NOTIFICATION_MSG_CODES.DELETE_DEACTIVATED_POLICIES_ACTION_SCHEDULED:
                POLICY_NOTIFICATION_MSG_CODES.DELETE_DEACTIVATED_POLICIES_SUCCESS, ts: Date.now()}});
    }
}
