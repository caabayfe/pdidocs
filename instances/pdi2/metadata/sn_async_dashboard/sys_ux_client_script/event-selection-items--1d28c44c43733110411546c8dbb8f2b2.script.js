/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var eArr = [];
    if (api.data.event_name_lookup == 'undefined') {
        return eArr;
    }

    for (var i = 0; i < api.data.event_name_lookup.output.data.GlideAggregate_Query.length; i++) {
        var e = {};

        e.id = api.data.event_name_lookup.output.data.GlideAggregate_Query[i].groupBy[0].value;
        e.label = api.data.event_name_lookup.output.data.GlideAggregate_Query[i].groupBy[0].value;

        eArr.push(e);

    }
    return eArr;
}
