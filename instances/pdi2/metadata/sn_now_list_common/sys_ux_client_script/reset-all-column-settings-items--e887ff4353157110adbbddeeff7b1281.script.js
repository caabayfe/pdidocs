/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {

    const menuItems = [{
        "id": "reset_to_column_defaults",
        "label": helpers.translateSync("Reset to column defaults"),
        disabled: !api.data.controller.editColumnsProps.enableResetToDefaults
    }, {
        "id": "reset_column_widths",
        "label": helpers.translateSync("Reset column widths"),
        disabled: !api.data.controller.editColumnsProps.enableResetWidths
    }]

    if (api.data.controller.listProps.enableColumnCalculations){
      menuItems.push({
        id: "clear_column_aggregates",
        label: helpers.translateSync("Clear calculations"),
        disabled: !api.data.controller.editColumnsProps.enableClearColumnCalculations
      })
    }

    return menuItems;
}
