/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    
    let metric = api.state.tabs[event.payload.selectedTabIndex].id;
    api.setState('metric', metric);
    
    let CLASS_NAME = 'class_name';
    let METRIC_NAME = 'metric.name';
    let ACTIVE = 'active';

    let SERVICE = 'service';
    let GROUP = 'group';

    let SERVICE_PREFIX = 'health_result.';
    let GROUP_PREFIX = 'result.';

    let dataType = api.context.props.type;
    let id = api.state.id;
    let groupOrService = api.context.props.groupOrServiceId;

    let defaultFilter = '';
    switch (dataType) {
        case 'service':
            defaultFilter = SERVICE_PREFIX + ACTIVE + '=true^' + SERVICE_PREFIX + METRIC_NAME + '=' + metric + '^'
                + SERVICE_PREFIX + CLASS_NAME + '=' + id;

            var isService = api.data.cmdb_health__check_service.output;
            if (groupOrService) {
                if (!isService) {
                    defaultFilter = defaultFilter + '^' + SERVICE + '=' + groupOrService;
                }
            }
            break;
        case 'group':
            defaultFilter = GROUP_PREFIX + ACTIVE + '=true^' + GROUP_PREFIX + METRIC_NAME + '=' + metric + '^'
                + GROUP_PREFIX + CLASS_NAME + '=' + id + '^' + GROUP + '=' + groupOrService;
            break;
        case 'class':
        default:
            defaultFilter = ACTIVE + '=true^' + METRIC_NAME + '=' + metric + '^'
                + CLASS_NAME + '=' + id;
            break;
    }
    
    api.setState('listFilter', defaultFilter);
}
