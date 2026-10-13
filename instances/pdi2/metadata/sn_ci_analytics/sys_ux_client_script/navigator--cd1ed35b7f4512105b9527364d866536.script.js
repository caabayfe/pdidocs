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
    const {
        startDate,
        endDate
    } = api.context.props;

    const navItemSelected = (route, extraParams = {}) => {
        api.emit("NAV_ITEM_SELECTED", {
            route,
            params: {
                startDate,
                endDate,
                ...extraParams
            }
        });
    };

    const id = event.payload.data.output.id;
    const eventType = event.payload.data.output.event_type;
    if (eventType == "Topic")
        navItemSelected("topic-details", {
            topicId: id
        });
    else if (eventType == "Topic Category")
        navItemSelected("category", {
            topicCategoryId: id
        });
}
