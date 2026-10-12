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
    const extraParams = api.context.props.extraParams;
    const gapStatusParam = "gap_status!=unmarked_as_gap^gap_status!=resolved";
    const actionStrategyParam = "action_strategy.active=true";
    const filterUnaryClustersParam = "group_descriptionINjavascript: new sn_km_gen_ai.KnowledgeCentreClientSideUtils().filterUnaryClusters();";

    let title;
    let clusterSelected = false;
    helpers.translate("Knowledge Gap Candidates").then((translatedText) => {title = translatedText;}); // Default title
    let newQuery = ""; // Default new query

    // If extraParams is populated, parse the query and rebuild it
    if (extraParams) {
        for (let param of extraParams.split("^")) {
            // If query includes group_description=, set the title to be the group description
            if (param.includes("group_description=")) {
                title = param.split("=")[1];
                clusterSelected = true;
            }

            // Detect task type filter. Accept both the legacy "=" form (old saved URLs)
            // and the current INSTANCEOF form, and normalize legacy equality to INSTANCEOF
            // so child-class rows are not excluded from the drilldown list.
            const legacyTaskTypePrefix = "task.sys_class_name=";
            const instanceofTaskTypePrefix = "task.sys_class_nameINSTANCEOF";
            if (param.startsWith(legacyTaskTypePrefix)) {
                const taskType = param.substring(legacyTaskTypePrefix.length);
                api.setState("selectedTaskTypeId", taskType);
                param = `${instanceofTaskTypePrefix}${taskType}`;
            } else if (param.startsWith(instanceofTaskTypePrefix)) {
                const taskType = param.substring(instanceofTaskTypePrefix.length);
                api.setState("selectedTaskTypeId", taskType);
            }

            // Add the param to the new query if it's not already in the defined params above
            if (!(param.includes(gapStatusParam) || param.includes(actionStrategyParam) || param.includes(filterUnaryClustersParam))) {
                newQuery += `${param}^`;
            }
        }
    }

    // Add defined params to the new query
    newQuery += `${gapStatusParam}^${actionStrategyParam}`;
    
    // If cluster is not selected, add the cluster filter
    if (!clusterSelected) {
        newQuery += `^${filterUnaryClustersParam}`;
    }
    
    api.setState("listTitle", title);
    api.setState("listFilters", newQuery);
    api.setState("parFilters", newQuery);
}
