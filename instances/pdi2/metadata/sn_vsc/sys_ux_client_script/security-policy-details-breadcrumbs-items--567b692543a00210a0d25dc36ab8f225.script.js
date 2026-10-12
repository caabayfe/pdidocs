/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
    var href = '';
    var pageParam = api.context.props.query;
    var title = api?.data?.get_policy_record_details?.output?.name || "";
    if (pageParam) {
        href = 'now/security-center/security_policies/params/query/' + pageParam;
    } else {
        href = 'now/security-center/security_policies';
    }
    return [{
        'label': helpers.translateSync('All security policies'),
        'href': href
    }, {
        "label": title
    }];
}
