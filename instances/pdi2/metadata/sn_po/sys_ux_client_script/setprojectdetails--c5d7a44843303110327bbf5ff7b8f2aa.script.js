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
    const {
        projectNumber,
        state,
        status,
        paDashboardName,
        paDashboardId,
        canAccessPaDashboard,
        description,
        name,
        goal,
        projectEntities,
        lastMined,
        sysCreatedBy,
        errorMessage,
        retired,
        source,
    } = api.data.get_project_details_1.output.data.GlidePromin_Query.projectConfiguration;

    const parentEntity = projectEntities.find((data) => data.parentId == null);
    
    if (!parentEntity) {
        api.setState('resetPrimaryEntity', true);
    }

    const ismining = state.value === "MINING_DATA" || state.value === "SCHEDULED";
    const isMaint = api.context.session.user.roles?.includes('maint');
    const isFreemium = source.startsWith('FREEMIUM');
    
    let projectDetails = {
        projectNumber,
        name,
        description,
        state: state.value,
        status: status.value,
        paDashboardName,
        goal,
        paDashboardId,
        lastMined,
        sysCreatedBy,
        errorMessage,
        sourceType: parentEntity?.sourceType?.value || 'TABLE',
        retired,
        canAccessPaDashboard,
        ismining,
        readonly: (!isMaint && isFreemium) || ismining,
        projectEntities,
    };

    if (parentEntity?.sourceType.value == "REPORT_SOURCE" || parentEntity?.sourceType.value == "EXTERNAL_DATA") {
        projectDetails.source = parentEntity?.name;
        projectDetails.sourceId = parentEntity?.sourceId;
    } else {
        projectDetails.source = parentEntity ? `${parentEntity.table.label} (${parentEntity.table.name})` : '';
    }

    if (paDashboardId) {
        api.data.get_dashboard_data.refresh();
        api.setState('hideKPISection', false);
    }

    api.setState('selectedSourceLabel', parentEntity ? parentEntity.table.name : await helpers.translate('Table'));
    api.setState('projectDetails', projectDetails);
    // Set project name in workspace tab title
    if (projectDetails.name) {
        helpers.screen.updateStatus({
            title: await helpers.translate('{0} | Set Objectives', projectDetails.name),
        });
    }
    api.setState('isEditing', true);
    if (projectDetails.sourceType === 'PLAYBOOK_DATA') {
        api.setState('isPlaybookSourceTypeProject', true);
        if (projectEntities[0].filter.displayValue) {
            // always playbook fixed filters are not editable.
            // ex: 'Process Definition Source = Remediate server .and. State = Complete .and. Archive = .and. Process Variant is empty';
            // Split the string by ' .and. ' to get each key-value part
            const parts = projectEntities[0].filter.displayValue.split(' .and. ');

            // Find the part that starts with 'Process Definition Source = '
            const sourcePart = parts.find(part => part.startsWith('Process Definition Source = '));

            if (sourcePart) {
                // Split by '=' and trim to get the value
                const processDefinitionSource = sourcePart.split('=')[1].trim();
                api.setState('selectedPlaybookDefinitionItems', [{ id: processDefinitionSource, label: processDefinitionSource }]);
            }
        }
    }
    api.data.get_system_properties.refresh();
}
