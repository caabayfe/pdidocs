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
    api.data.process_configuration_rule_based_findings.refresh();
    api.data.process_configuration_automated_findings.refresh();
    if (api.data.get_process_definition.results.length == 0) {
        return;
    }
    if (api.data.process_configuration_automated_findings.results.length == 0 && api.data.process_configuration_rule_based_findings.results.length == 0) {
        return;
    }

    api.data.list_controller_3.updateQuery({
            encodedQuery: `process_def.sys_id=${api.data.get_process_definition.results[0].sys_id.value}^active=true`
    });
    api.data.list_controller_4.updateQuery({
            encodedQuery: `process_def.sys_id=${api.data.get_process_definition.results[0].sys_id.value}^active=true`
    });

    if (event.elementId == 'rule_based_list_header') {
        api.data.list_controller_3.refreshRequested();
    } else {
        api.data.list_controller_4.refreshRequested();
    }
}
