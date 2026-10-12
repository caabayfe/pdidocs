/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var qArr = [];
    if (api.data.queue_lookup == 'undefined') {
        return qArr;
    }
    
    for (var i = 0; i < api.data.queue_lookup.output.data.GlideAggregate_Query.length; i++) {
        var q = {};

        q.id = api.data.queue_lookup.output.data.GlideAggregate_Query[i].groupBy[0].value;
        q.label = api.data.queue_lookup.output.data.GlideAggregate_Query[i].groupBy[0].value;

        qArr.push(q);

    }
    return qArr;
}
