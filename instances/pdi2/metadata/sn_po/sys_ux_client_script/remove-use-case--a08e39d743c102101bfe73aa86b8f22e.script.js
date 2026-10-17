/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { selectedEntity, currentUseCase, entityUseCasesMap } = api.state;
    if (!selectedEntity || !selectedEntity.table) {
        return;
    }
    const selectedEntityId = selectedEntity._row_data.uniqueValue;
    if (!selectedEntityId in entityUseCasesMap) {
        return;
    }

    let useCaseTable = '';

    // Set use case table to be deleted
    if (currentUseCase === 'includeApprovals') {
        useCaseTable = 'sysapproval_approver';
    } else if (currentUseCase === 'includeSLABreach') {
        useCaseTable = 'task_sla';
    } else if (currentUseCase.startsWith('createChildTable')) {
        useCaseTable = currentUseCase.split(':')[1];
    }
    
    // Clean up dependent entities of SLA breach and Approval analysis
    if (!currentUseCase.startsWith('createChildTable')) {
        if (entityUseCasesMap[selectedEntityId][currentUseCase].dependentEntityIds.length > 0) {
            api.data.delete_use_case_residuals.execute({
                table: 'promin_project_entity',
                query: 'sys_idIN' + entityUseCasesMap[selectedEntityId][currentUseCase].dependentEntityIds.join(','),
            });
        }
    }

    // Clean up activity defs from Approval analysis
    if (currentUseCase === 'includeApprovals') {
        api.data.delete_use_case_residuals.execute({
            table: 'promin_activity_def',
            query: `entity=${selectedEntityId}^field=approval`,
        });
    }

    // Clean up dependent entities of child tables
    if (currentUseCase.startsWith('createChildTable')) {
        const foundIndex = entityUseCasesMap[selectedEntityId].childTables.findIndex(ct => ct.name === useCaseTable);
        if (foundIndex === -1) {
            return;
        }
        if (entityUseCasesMap[selectedEntityId].childTables[foundIndex].dependentEntityIds.length > 0) {
            api.data.delete_use_case_residuals.execute({
                table: 'promin_project_entity',
                query: 'sys_idIN' + entityUseCasesMap[selectedEntityId].childTables[foundIndex].dependentEntityIds.join(','),
            });
        }
    }

    // If child table use cases is being removed add relation_type = CHILD to the query
    const querySuffix = currentUseCase.startsWith('createChildTable')
        ? '^relation_type=CHILD'
        : '';

    api.data.delete_use_case_entities.execute({
        table: 'promin_project_entity',
        query: `project=${api.context.props.projectId}^parent_entity=${selectedEntityId}^table=${useCaseTable}` + querySuffix,
    });
    
    api.setState('isCaseRemovalInprogress', true);
}
