/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.imports
 */
function evaluateProperty({
    api
}) {
    const data = api.data.analytics_locale_get_list_1.output;
    const {
        backToFunnelLabel,
        editFunnelText,
        createFunnelText
    } = api.state.translations;
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
        id: 'funnels',
        label: (data) ? data.backToFunnelLabel : backToFunnelLabel,
        href: link,
    }];
    if (api.context.props.funnelId) {
        link += `/funnel-details/${api.context.props.funnelId}`;
        const funnelName = api.data.get_funnel_record.output.name;
        items.push({
            id: 'funnel-details',
            label: funnelName,
            href: link,
        });
        items.push({
            id: 'funnel-builder',
            label: (data) ? data.editFunnelText : editFunnelText,
        });

    } else
        items.push({
            label: (data) ? data.createFunnelText : createFunnelText
        });

    return items;
}
