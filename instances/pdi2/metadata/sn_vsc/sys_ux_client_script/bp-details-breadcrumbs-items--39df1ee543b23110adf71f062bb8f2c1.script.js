/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var href = '';
    var pageParam = api.context.props.query;
    var title = api?.data?.bp_details_form?.form?.fields?.name?.displayValue;
    if (pageParam) {
        href = 'now/security-center-posture/best_practices_home/params/query/' + pageParam;
    } else {
        href = 'now/security-center-posture/best_practices_home';
    }
    return [{
        'label': helpers.translateSync('All Best Practices'),
        'href': href
    }, {
        'label': title
    }];
}
