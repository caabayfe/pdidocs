function script({api, event, helpers}) {
var selectedPolicies = event?.payload?.selectedEvents;
    if (!selectedPolicies || selectedPolicies.length <= 0) {
        return;
    }
    var query = 'sys_idIN';
    var ids = [];
    for (var i = 0; i < selectedPolicies.length; i++) {
        var id = selectedPolicies[i]?.data?.policyRuntimeId;
        ids.push(id);
    }
    query += ids.join(',');
    api.setState('scheduledPolicyFilter', query);
    api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', {
        viewportElementId: 'viewport_1',
        route: 'scheduled-policies',
        fields: {
            fixedFilter: query
        }
    });
    helpers.modal.open('scheduled_policy_list_modal', {  bare: true });
}
