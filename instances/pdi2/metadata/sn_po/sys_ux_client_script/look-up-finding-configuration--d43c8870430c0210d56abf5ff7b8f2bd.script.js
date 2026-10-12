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
    if (api.data.look_up_finding_configuration.results.length == 0) {
        api.data.look_up_finding_configuration.refresh();
        return;
    }

    function getConfigValue(name, value) {
        if (api.state.automatedFindingForm.type.value == "EXTRA_STEP" && name == 'maxRatio' || name == 'minRatio') {
            return value == 0 ? 0 : parseInt(100 / value);
        }
        return value;
    }
    const findingConfiguration = api.data.look_up_finding_configuration.results;
    const findingConfigurationMap = {};
    findingConfiguration.forEach((item) => {
        findingConfigurationMap[item.configuration_name.value] = {};
        findingConfigurationMap[item.configuration_name.value].value = getConfigValue(item.configuration_name.value, item.configuration_value.value);
        findingConfigurationMap[item.configuration_name.value].invalid = false;
        findingConfigurationMap[item.configuration_name.value].sys_id = item.sys_id.value;
        findingConfigurationMap[item.configuration_name.value].description = item.description.displayValue;
    });

    api.setState('findingConfigurationMap', findingConfigurationMap);

    const stageItems = api.state.stepper.map((item) => {
        let state = 'done';
        return { ...item,
            disabled: false,
            progress: item.id == api.state.selectedStage ? 'none' : state
        };
    });
    api.setState('stepper', stageItems);
  const isTouchpointType = api.state.automatedFindingForm.type.value === "NODE_TOUCH_POINT_OUTLIER" || api.state.automatedFindingForm.type.value === "EXTREME_NODE_TOUCH_POINT";
    const source = api.state.automatedFindingForm.name.applyToSource;
    if (isTouchpointType) {
        if (source == 'process') {
            api.data.get_process_configuration.execute({
                table: api.state.automatedFindingForm.table.selectedValue
            });
        } else {
            api.data.fetch_project_version.execute({
                projectId: api.context.props.projectId,
            });
        }
    }
}
