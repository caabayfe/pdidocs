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
    const automatedFindingForm = { ...api.state.automatedFindingForm
    };
    const missingFields = [];
    if (automatedFindingForm.findingName?.value?.trim() === '') {
        missingFields.push(await helpers.translate('Name'));
    }
    if (automatedFindingForm.fields?.value?.trim() == '') {
        missingFields.push(await helpers.translate('Field'));
    }
    if (!automatedFindingForm.category.selectedValue || automatedFindingForm.category?.selectedValue?.trim() === '') {
        missingFields.push(await helpers.translate('Category'));
    }
    if (automatedFindingForm.type?.value?.trim() === '') {
        missingFields.push(await helpers.translate('Type'));
    }

    if (missingFields.length > 0) {
        automatedFindingForm.alertMessage = await helpers.translate('The following mandatory fields are not filled in: {0}', missingFields.join(', '));
        automatedFindingForm.isAlertHidden = false;
        api.setState('automatedFindingForm', automatedFindingForm);
        return;
    }
    if (event.elementId != 'continue_later' && api.state.findingId && !api.state.formUpdated){
        const automatedFindingForm = { ...api.state.automatedFindingForm
        };
        automatedFindingForm.isAlertHidden = true;
        api.setState('automatedFindingForm', automatedFindingForm);
        api.data.look_up_finding_configuration.refresh();
        const stageItems = api.state.stepper.map((item) => {
            let state = 'done';
            return { ...item,
                disabled: false,
                progress: item.id == 'configure' ? 'none' : state
            };
        });
        api.setState('stepper', stageItems);
        api.setState('selectedStage', 'configure');
        return;
    }
    const impactedKpiList = automatedFindingForm.impacted_kpi.selectedItems.map(kpi => kpi.id);
    const applyToSource = automatedFindingForm.name.applyToSource;
    var findingPayload = JSON.stringify({
        name: automatedFindingForm.findingName.value,
        table: automatedFindingForm.table.selectedValue,
        category: automatedFindingForm.category.selectedValue,
        process_def: applyToSource == 'process' ? automatedFindingForm.name.sys_id: null,
        project: applyToSource == 'project' ? automatedFindingForm.name.sys_id : null,
        type: automatedFindingForm.type.value,
        field: automatedFindingForm.fields.value,
        impacted_kpis: impactedKpiList || [],
        active: automatedFindingForm.active.value,
        copied_from: null,
    });
   
    if (api.state.editing || api.state.findingId) {
        api.data.update_automated_finding_definition.execute({
            findingPayload,
            sysId: api.context.props.findingId || api.state.findingId
        });
    }else{
        api.data.create_automated_finding_definition.execute({
            findingPayload
        });
    }
}
