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
    if (api.data.look_up_process_def_info.results?.length == 0) {
        return;
    }
    const { value, displayValue } = api.data.look_up_process_def_info.results[0].table;
    const automatedFindingForm = { ...api.state.automatedFindingForm
    };
    automatedFindingForm.name.value = value;
    automatedFindingForm.name.applyToSource = 'process';
    automatedFindingForm.name.readOnly = true;
    automatedFindingForm.name.sys_id = api.context.props.projectId;

    const entityId = api.data.look_up_process_def_info.results[0]._row_data.uniqueValue;
    automatedFindingForm.table.selectedValue = value;
    automatedFindingForm.table.selectedValue = value;
    automatedFindingForm.table.displayValue = displayValue;
    api.setState('automatedFindingForm', automatedFindingForm);

    api.data.get_finding_fields.execute({
        tableName: value,
        currentTableName: 'promin_automated_finding',
        entityId: entityId,
    });
    const isTouchpointType = automatedFindingForm.type.value === "NODE_TOUCH_POINT_OUTLIER" || automatedFindingForm.type.value === "EXTREME_NODE_TOUCH_POINT";
    if(isTouchpointType) {
      api.data.get_process_configuration.execute({
          table: automatedFindingForm.table.selectedValue
      });
    }
}
