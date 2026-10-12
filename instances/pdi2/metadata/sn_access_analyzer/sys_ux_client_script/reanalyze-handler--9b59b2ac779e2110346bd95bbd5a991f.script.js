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
    var request = api.data.request_resource.result;

    var entitySysIdVal;
    switch (request.analyze_by.value) {
        case "User":
            entitySysIdVal = request.user.value;
            break;
        case "Group":
            entitySysIdVal = request.group.value;
            break;
        case "Role":
            entitySysIdVal = request.role.value;
            break;
    }

    var targetNameVal;
    switch (request.resource_type.value) {
        case "record":
            targetNameVal = request.target_table.value;
            break;
        case "client_callable_script_include":
            targetNameVal = request.target_client_callable_script_include.value;
            break;
        case "rest_endpoint":
            targetNameVal = request.target_rest_endpoint.value;
            break;
        case "ui_page":
            targetNameVal = request.target_ui_page.value;
            break;
    }

    var targetMethodVal = request.target_rest_endpoint_method.value == "undefined" ? "" : request.target_rest_endpoint_method.value;
    let oprMap = {};
    api.data.acl_operations_records.results.forEach(record => oprMap[record._row_data.uniqueValue] = record.name.value);
    let operations = request.operations.value.split(/[ ,]+/).map(sysId => oprMap[sysId]);
    var requestPayload = {
        entitySysId: entitySysIdVal,
        entityType: request.analyze_by.value,
        targetName: targetNameVal,
        targetResource: request.resource_type.value,
        targetField: request.target_field.value,
        targetRecord: request.target_record.value,
        targetMethod: targetMethodVal,
        targetOperations: operations
    };

    var results = api.data.debug_logs.execute({
        "requestPayload": requestPayload
    });
}
