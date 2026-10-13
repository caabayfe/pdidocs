/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    switch(event.name) {
        case "MACROPONENT_READY": 
        case "MACROPONENT_PROPERTY_CHANGED": {
            const {startDate, endDate, selectedCategories} = api.context.props;
            const {
                encodeFilter,
                generatePARFilterQuery
            } = imports["sn_ci_analytics.VADasboardUtils"]();
            const filter = {
                from_date: startDate,
                to_date: endDate,
                category: selectedCategories
            };
            api.setState("parFilters", generatePARFilterQuery(encodeFilter(filter), [
                "sn_ci_analytics_st_topic_occurrence"
            ]));
            break;
        }

        case "NOW_VIS_WRAPPER#CLICKED":
        case "ITEM_SELECTED": {
            const {
                navigateToTopicDetailsFromDataViz
            } = imports["sn_ci_analytics.VADasboardUtils"](api, helpers);
            navigateToTopicDetailsFromDataViz(event.payload.params.query);
            break;
        }
    }
}
