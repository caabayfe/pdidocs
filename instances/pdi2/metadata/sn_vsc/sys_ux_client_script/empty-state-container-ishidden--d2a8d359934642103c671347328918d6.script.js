/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var count = api?.data?.get_notification_count?.output?.data?.GlideAggregate_Query[0]?.count;
    return count === undefined || count > 0;
}
