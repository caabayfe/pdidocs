/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const tableLabel = helpers.translateSync("Table");
    const applicationLabel = helpers.translateSync("Application");
    var scope = api.data.rule_management_dmc.tableScope;
    if(!scope || !scope.name) {
        return;
    }

    var scopeName = scope.name;
    if (api.data.rule_management_dmc.tableScope.sysID != api.data.rule_management_dmc.currentScope.sysID) {
        scopeName = "<now-icon class='now-alert-icon'  size='sm'  icon='circle-info-outline'></now-icon>" + " " + scopeName;
    }
    return [{
        label: tableLabel,
        value: {
            type: "string",
            value: api.data.rule_management_dmc.tableMetadata.label + " [" + api.context.props.tableName + "]"
        }
    }, {
        label: applicationLabel,
        value: {
            type: "html",
            value: scopeName
        }
    }];

}
