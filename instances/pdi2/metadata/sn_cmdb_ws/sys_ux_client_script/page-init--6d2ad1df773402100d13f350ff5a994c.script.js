/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    let CIS = await helpers.translate("CIs");

    let tabs = {};
    let title = "";
    let name = api.context.props.name;
    let list_title = api.context.props.name + " " + CIS;

    switch (api.context.props.card) {
        case 'completeness':
            tabs= [{
                "id": "required",
                "label": await helpers.translate("Missing required attributes"),
                "resultsLabel": await helpers.translate("with missing required attributes")
            }, {
                "id": "recommended",
                "label": await helpers.translate("Missing recommended attributes"),
                "resultsLabel": await helpers.translate("with missing recommended attributes")
            }];
            title = await helpers.translate("Completeness for ") + name;
            break;
        case 'correctness':
            tabs= [{
                "id": "duplicate",
                "label": await helpers.translate("Duplicate CIs"),
                "resultsLabel": await helpers.translate("with duplicate CIs")
            }, {
                "id": "Orphan",
                "label": await helpers.translate("Orphaned CIs"),
                "resultsLabel": await helpers.translate("with orphaned CIs")
            }, {
                "id": "staleness",
                "label": await helpers.translate("Stale CIs"),
                "resultsLabel": await helpers.translate(" that are stale")
            }]; 
            title = await helpers.translate("Correctness for ") + name;
            break;
        case 'compliance':
            tabs = [{
                "id": "audit",
                "label": await helpers.translate("Audited"),
                "resultsLabel": await helpers.translate("that are audited")
            }];
            title = await helpers.translate("Compliance for ") + name;
            break;
    }

    title = title + " " + CIS;
    let metric = api.context.props.metric;
    let id = api.context.props.id;

    // select the tab index for the selected metric. 
    const selectedTabIndex = tabs.findIndex(tab => tab.id === metric);
    
    api.setState('tabs', tabs);
    api.setState('title', title);
    api.setState('list_title', list_title);
    api.setState('metric', metric);
    api.setState('id', id);
    api.setState('selectedTabIndex', selectedTabIndex);
    
    // determine the result table we need to query + the columns we need to show
    let query = api.context.props.pieChartQuery;
    let dataType = api.context.props.type;
    let groupOrService = api.context.props.groupOrServiceId;

    let ACTIVE = 'active';
    let CI = 'ci';
    let DISCOVERY_SOURCE = 'discovery_source';
    let OWNERSHIP = 'ownership';
    let DESCRIPTION = 'description';
    let SYS_UPDATED_ON = 'sys_updated_on';
    let CLASS_NAME = 'class_name';
    let METRIC_NAME = 'metric.name';

    let SERVICE = 'service';
    let GROUP = 'group';

    let SERVICE_PREFIX = 'health_result.';
    let GROUP_PREFIX = 'result.';
    
    let table = '';
    let view = '';
    let defaultFilter = '';
    let columns = "";
    switch (dataType) {
        case 'service':
            table = 'cmdb_health_result_service_map';
            columns = "health_result.ci,health_result.task,health_result.class_name,health_result.last_evaluated_on,health_result.metric,source";
            view = 'e78df96ba34602104298b6ae041e6133';
            defaultFilter = SERVICE_PREFIX + ACTIVE + '=true^' 
                + SERVICE_PREFIX + METRIC_NAME + '=' + metric + '^'
                + SERVICE_PREFIX + CLASS_NAME + '=' + id;
            var isService = api.data.cmdb_health__check_service.output;
            if (groupOrService) {
                if (!isService) {
                    defaultFilter = defaultFilter + '^service=' + groupOrService;
                }
            }
            break;
        case 'group':
            table = 'cmdb_health_result_group_map';
            columns = "result.ci,result.task,result.class_name,result.last_evaluated_on,result.metric,source";
            view = 'e8adf5aba34602104298b6ae041e6134';
            defaultFilter = GROUP_PREFIX + ACTIVE + '=true^' 
                + GROUP_PREFIX + METRIC_NAME + '=' + metric + '^'
                + GROUP_PREFIX + CLASS_NAME + '=' + id + '^' + GROUP + '=' + groupOrService;
            break;
        case 'class':
        default:
            table = 'cmdb_health_result';
            columns = "ci,task,class_name,last_evaluated_on,metric,source";
            view = '2b0db96ba34602104298b6ae041e61d6';
            defaultFilter = ACTIVE + '=true^' 
                + METRIC_NAME + '=' + metric + '^'
                + CLASS_NAME + '=' + id;
            break;
    }

    api.setState('columns',columns);

    if (query) {
        defaultFilter = query;
    }
    
    api.setState('groupOrServiceId', groupOrService);
    api.setState('listTable', table);
    api.setState('listView', view);
    api.setState('listFilter', defaultFilter);
}
