/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const payload = api.context.props.payload;
    const {
        title
    } = payload;
    const {
        badge_color,
        badge_text,
        items
    } = payload.props_details;
    const formatProgressBar = function(items) {
        if (!items.length) return [];
        return items.map(function(item) {
            return {
                "title": item.title,
                "status": item.status && item.status.toLowerCase() || "start",
                "url": item.url
            };
        });
    };
    const checklistCardPayload = {
        title,
        badgeColor: badge_color,
        badgeText: badge_text,
        items: formatProgressBar(items)
    };
    api.setState('payload', checklistCardPayload);
}
