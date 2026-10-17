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
    api.setState('isLoading', false);
    if (api.data.fetch_automated_finding.results.length == 0) {
        return;
    }
    const findingDetails = api.data.fetch_automated_finding.results[0];

    const automatedFindingForm = { ...api.state.automatedFindingForm
    };

    if (findingDetails.project.displayValue != "") {
        automatedFindingForm.name.value = findingDetails.project.displayValue;
        automatedFindingForm.name.sys_id = findingDetails.project.value;
        automatedFindingForm.name.applyToSource = 'project';
    } else {
        automatedFindingForm.name.value = findingDetails.process_def.displayValue;
        automatedFindingForm.name.sys_id = findingDetails.process_def.value;
        automatedFindingForm.name.applyToSource = 'process';
    }

    automatedFindingForm.name.readOnly = true;
    automatedFindingForm.impacted_kpi.selectedItems = [];

    if (findingDetails.impacted_kpis.value !== null) {
        const kpiValues = findingDetails.impacted_kpis.value.split(',');
        const kpiDisplayValues = findingDetails.impacted_kpis.displayValue.split(',');
        const selectedImpactedKPIs = [];
        if (kpiValues.length === kpiDisplayValues.length) {
            for (let i = 0; i < kpiValues.length; i += 1) {
                selectedImpactedKPIs.push({
                    id: kpiValues[i],
                    label: kpiDisplayValues[i],
                });
            }
        }
        automatedFindingForm.impacted_kpi.selectedItems = selectedImpactedKPIs;
        automatedFindingForm.impacted_kpi.messages = [];
    }

    automatedFindingForm.fields.value = findingDetails.field.value;
    automatedFindingForm.fields.displayValue = findingDetails.field.displayValue;
    automatedFindingForm.category.selectedValue = findingDetails.category.value;
    automatedFindingForm.type.value = findingDetails.type.value;
    automatedFindingForm.active.value = findingDetails.active.value;
    automatedFindingForm.findingName.value = findingDetails.name.value;
    automatedFindingForm.table.selectedValue = findingDetails.table.value;
    automatedFindingForm.table.displayValue = findingDetails.table.displayValue;
    api.setState('automatedFindingForm', automatedFindingForm);

    const isTouchpointType = automatedFindingForm.type.value === "NODE_TOUCH_POINT_OUTLIER" || automatedFindingForm.type.value === "EXTREME_NODE_TOUCH_POINT";
    const source = automatedFindingForm.name.applyToSource;
    if (isTouchpointType) {
        if (source == 'process') {
            api.data.get_process_configuration.execute({
                table: automatedFindingForm.table.selectedValue
            });
        } else {
            api.data.fetch_project_version.execute({
                projectId: api.context.props.projectId,
            });
        }
    }
    const projectSource = api.data.look_up_project_info?.result?.source?.value || '';
    const isMaint = api.context.session.user.roles?.includes('maint');
    const isFreemium = projectSource && projectSource.startsWith('FREEMIUM');
    const isProject = source === 'project';

    let isReadOnly = false;

    if (isProject && !isMaint && isFreemium) {
        isReadOnly = true;
    } else {
        if (api.state.isediting && source) {
            isReadOnly = isProject ? !api.state.permissions.promin_automated_finding.canWrite : !api.state.permissions.promin_process_def.canWrite || !api.state.permissions.promin_automated_finding.canWrite;
        } else {
            isReadOnly = isProject ? !api.state.permissions.promin_automated_finding.canCreate : !api.state.permissions.promin_process_def.canCreate || !api.state.permissions.promin_automated_finding.canCreate;
        }
    }
    api.setState('isReadOnly', isReadOnly);

    helpers.screen.updateStatus({
        title: await helpers.translate('{0} | Edit improvement opportunity definition', findingDetails.name.value),
    });
}
