/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    if (api.context.props.isSrp) {
        let table = api.state.impactRelatedListSectionDetails.selectedImpactRelatedList.table;
        let tableRoute;
        if(table == "task_ci")
            tableRoute = "task_ci.task";
        else if(table == "task_cmdb_ci_service")
            tableRoute = "task_cmdb_ci_service.task";
        api.emit("SOW_RECORD#ROUTE_REQUESTED", {
            route: tableRoute,
            type: "related-list"
        });
    } else {
        let subTabIndex = api.context.props.relatedLists.findIndex(
            (relatedList) => {
                return relatedList.table == api.state.impactRelatedListSectionDetails.selectedImpactRelatedList.table && relatedList.fixedQuery == api.state.impactRelatedListSectionDetails.selectedImpactRelatedList.fixedQuery.replaceAll("${sysId}", api.context.props.sysId);
            }
        );
        let paramsObj = [];
        paramsObj.push("subTabIndex");
        paramsObj.push(subTabIndex);
        const finalParams = paramsObj.join("/");
        api.emit('CONTENT_UPDATED', {
            params: {
                extraParams: finalParams
            }
        });
        helpers.timing.setTimeout(() => {
            api.emit("VIEWPORT_ROUTE_REQUESTED", {
                "route": "related_list_collection",
                "fields": {
                    "show": true,
                    "relatedListTabName": "related_list"
                }
            });
        }, 5);
    }

}
