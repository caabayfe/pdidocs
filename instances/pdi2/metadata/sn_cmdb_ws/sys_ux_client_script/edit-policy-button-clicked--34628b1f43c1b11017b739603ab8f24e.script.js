function script({ api, event, helpers, imports }) {
    const {
        PAGE_ROUTES
    } = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();

    // navigate to the form page
    helpers.navigate.to(
        PAGE_ROUTES.DM_POLICY_FORM,
        {
            "policySysId": api.data.getDataManagerPolicyDetails.output.policyData.policyId,
            "ts": Date.now()
        },
        null,
        null,
        null,
        'current');
}
