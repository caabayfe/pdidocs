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
    
    // if we are creating a new finding and that updates the findingId param, we dont want this script to get executed.
    if (api.state.findingCreated && event.payload.name!= "patternName") {
        return;
    }
    if (event.payload.previousValue == event.payload.value) {
        return;
    }
    if (!event.payload.value) {
        return;
    }
    if (event.payload.name == "findingId") {
        api.setState('editing', true);
        api.setState('findingId', event.payload.value);
        api.data.fetch_automated_finding.refresh();
        const stageItems = api.state.stepper.map((item) => {
            let state = 'done';
            return { ...item,
                disabled: false,
                progress: item.id == 'details' ? 'none' : state
            };
        });
        api.setState('selectedStage','details');
        api.setState('stepper', stageItems);
    } else {
    api.setState('findingId', null);
    api.data.look_up_project_info.refresh();
    api.data.look_up_process_def_info.refresh();
    api.setState('selectedStage','details');
    api.setState('editing', false);
    const automatedFindingForm = { ...api.state.automatedFindingForm
    };
    automatedFindingForm.findingName.value = "";
    automatedFindingForm.fields.value = "";
    automatedFindingForm.active.value = true;
    const selectedType = api.state.automatedFindingForm.type.list.find((type) => type.id == api.state.findingTypesMap[event.payload.value]);
    automatedFindingForm.type.value = selectedType ? selectedType.id : '';
    automatedFindingForm.type.label = selectedType ? selectedType?.label : '';
    automatedFindingForm.category.selectedValue = '';
    automatedFindingForm.impacted_kpi.selectedItems = [];
    let condition = `project=${api.context.props.projectId}^relation_type=^parent_entityISEMPTY`;
    api.setState('condition', condition);
    let processCondition = `sys_id=${api.context.props.projectId}`;
    api.setState('processCondition', processCondition);
    api.setState('automatedFindingForm', automatedFindingForm);
    const stageItems = api.state.stepper.map((item) => {
        let state = 'done';
        return { ...item,
            disabled: item.id == 'details' ? false : true,
            progress: 'none'
        };
    });
    api.setState('stepper', stageItems);
    helpers.screen.updateStatus({
        title: await helpers.translate('Create Improvement opportunity definition'),
    });
  }
}
