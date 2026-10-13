/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.imports
 */
function evaluateProperty({
    api
}) {
    const {
        funnelName
    } = api.state;
    const data = api.data.analytics_locale_get_list_1.output;
    const {
        backToFunnelLabel,
        funnelDataLabel
    } = api.state.translation;
    const {
        startDate,
        endDate
    } = api.context.props;

    const appId = api.context.app.ace_application_id;

    var link = '/now/conversation/analytics';
    if (appId == "f80203e4c3020110fc869bc8a840dd17")
        link = '/now/conversation/settings';
    link += `/funnels/params/timestamp/${+new Date()}`;

    if (startDate && endDate) {
        link += `/start-date/${startDate}/end-date/${endDate}`;
    }
    const items = [{
        "label": (data) ? data.backToFunnelLabel : backToFunnelLabel,
        "href": link
    }];
    if (funnelName) {
        items.push({
            "label": funnelName
        });
    } else {
        items.push({
            "label": (data) ? data.funnelDataLabel : funnelDataLabel
        });
    }

    return items;
}
