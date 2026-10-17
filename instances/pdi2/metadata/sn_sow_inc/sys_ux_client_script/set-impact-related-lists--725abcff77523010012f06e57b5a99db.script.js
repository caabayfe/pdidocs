/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    if (!api.context.props.relatedLists || api.context.props.relatedLists.length == 0 || api.state.impactRelatedListSectionDetails.isRelatedListInitialized == true) {
        return;
    }
    var impactCards = [{
        table: "task_ci",
        relatedList: "task_ci.task"
    }, {
        table: "task_cmdb_ci_service",
        relatedList: "task_cmdb_ci_service.task"
    }, {
        table: "task_ci",
        relatedList: "task_ci.task",
        customProps: {
            idPart: ".ci_has_assets",
            title: await helpers.translate("Assets"),
            fixedQueryPart: "^ci_item.asset!=NULL",
            view: "sow_incident_overview_asset"
        }
    }];

    var impactRelatedLists = {};
    impactCards.forEach((requiredRelatedList) => {
        let relatedList = api.context.props.relatedLists.filter((rl) => {
            return rl.table == requiredRelatedList.table && rl.value == requiredRelatedList.relatedList;
        });
        if (relatedList && relatedList.length > 0) {
            let variableProps = {
                id: relatedList[0].table + "-" + relatedList[0].value,
                displayName: relatedList[0].displayName,
                fixedQuery: relatedList[0].fixedQuery,
                view: "sow_incident_overview"
            };
            if (requiredRelatedList.customProps) {
                variableProps.id += requiredRelatedList.customProps.idPart;
                variableProps.displayName = requiredRelatedList.customProps.title;
                variableProps.fixedQuery += requiredRelatedList.customProps.fixedQueryPart;
                variableProps.view = requiredRelatedList.customProps.view;
            }
            impactRelatedLists[variableProps.id] = {
                "id": variableProps.id,
                "title": variableProps.displayName,
                "table": relatedList[0].table,
                "parentTable": relatedList[0].parentTable,
                "relatedListName": relatedList[0].value,
                "parentRecordSysId": api.context.props.sysId,
                "fixedQuery": variableProps.fixedQuery,
                "view": variableProps.view
            };
        }
    });

    var impactRelatedListSectionDetails = {};
    impactRelatedListSectionDetails['impactRelatedLists'] = impactRelatedLists;
    impactRelatedListSectionDetails['selectedImpactRelatedList'] = impactRelatedLists['task_ci-task_ci.task'];
    impactRelatedListSectionDetails['isRelatedListInitialized'] = true;
    api.setState('impactRelatedListSectionDetails', impactRelatedListSectionDetails);
}
