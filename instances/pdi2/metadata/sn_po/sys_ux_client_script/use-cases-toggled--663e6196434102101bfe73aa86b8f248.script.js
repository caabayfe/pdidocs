/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { selectedEntity, entityUseCasesMap } = api.state;
    if (!selectedEntity || !selectedEntity.table) {
        return;
    }
    const selectedEntityId = selectedEntity._row_data.uniqueValue;
    if (!selectedEntityId in entityUseCasesMap) {
        return;
    }

    if (event.elementId === 'approvals_toggle') {
        api.setState('currentUseCase', 'includeApprovals');
        if (event.payload.value) {
            // Approvals toggle switched on
            const approvalAnalysisPayload = JSON.stringify({
                projectId: api.context.props.projectId,
                parentEntityId: api.state.selectedEntity._row_data.uniqueValue,
                table: api.state.selectedEntity.table.value,
            });
            api.data.include_approval_analysis.execute({
                approvalAnalysisPayload,
            });
            const entityUseCasesMapCopy = { ...entityUseCasesMap };
            entityUseCasesMapCopy[selectedEntityId].includeApprovals.value = true;
            entityUseCasesMapCopy[selectedEntityId].includeApprovals.disabled = true;
            api.setState('entityUseCasesMap', entityUseCasesMapCopy);
        } else {
            // Approvals toggle switched off
            const entityUseCasesMapCopy = { ...entityUseCasesMap };
            entityUseCasesMapCopy[selectedEntityId].includeApprovals.value = false;
            entityUseCasesMapCopy[selectedEntityId].includeApprovals.disabled = false;
            api.setState('entityUseCasesMap', entityUseCasesMapCopy);
            api.setState('useCaseAction', 'KEEP');
            helpers.modal.open("[component-id$='revert_use_case_confirm']");
        }
    }

    if (event.elementId === 'sla_toggle') {
        api.setState('currentUseCase', 'includeSLABreach');
        if (event.payload.value) {
            // SLA breach toggle switched on
            const slaBreachEntityPayload = JSON.stringify({
                project: api.context.props.projectId,
                parent_entity: api.state.selectedEntity._row_data.uniqueValue,
                table: api.state.selectedEntity.table.value,
                sourceType: api.state.selectedEntity.source_type.value,
            });

            api.data.create_sla_breach_entity.execute({
                slaBreachEntityPayload,
            });

            const entityUseCasesMapCopy = { ...entityUseCasesMap };
            entityUseCasesMapCopy[selectedEntityId].includeSLABreach.value = true;
            entityUseCasesMapCopy[selectedEntityId].includeSLABreach.disabled = true;
            api.setState('entityUseCasesMap', entityUseCasesMapCopy);
        } else {
            // SLA breach toggle switched off
            const entityUseCasesMapCopy = { ...entityUseCasesMap };
            entityUseCasesMapCopy[selectedEntityId].includeSLABreach.value = false;
            entityUseCasesMapCopy[selectedEntityId].includeSLABreach.disabled = false;
            api.setState('entityUseCasesMap', entityUseCasesMapCopy);
            api.setState('useCaseAction', 'KEEP');
            helpers.modal.open("[component-id$='revert_use_case_confirm']");
        }
    }

    if (event.elementId === 'child_table_toggle') {
        api.setState('currentUseCase', `createChildTable:${event.context.item.value.name}:${event.context.item.value.label}`);
        if (event.payload.value) {
            // Create child table
            const payload = {
                projectId: api.context.props.projectId,
                parentEntityId: api.state.selectedEntity._row_data.uniqueValue,
                childTable: event.context.item.value.name,
            };

            api.data.create_child_table.execute({
                payload,
            });

            const entityUseCasesMapCopy = { ...entityUseCasesMap };
            const foundIndex = entityUseCasesMapCopy[selectedEntityId].childTables.findIndex(ct => ct.name === event.context.item.value.name);
            if (foundIndex === -1) {
                return;
            }
            entityUseCasesMapCopy[selectedEntityId].childTables[foundIndex].disabled = true;
            entityUseCasesMapCopy[selectedEntityId].childTables[foundIndex].value = true;
            api.setState('entityUseCasesMap', entityUseCasesMapCopy);   
        } else {
            // Remove child table
            const entityUseCasesMapCopy = { ...entityUseCasesMap };
            const foundIndex = entityUseCasesMapCopy[selectedEntityId].childTables.findIndex(ct => ct.name === event.context.item.value.name);
            if (foundIndex === -1) {
                return;
            }
            entityUseCasesMapCopy[selectedEntityId].childTables[foundIndex].value = false;
            entityUseCasesMapCopy[selectedEntityId].childTables[foundIndex].disabled = false;
            api.setState('entityUseCasesMap', entityUseCasesMapCopy);
            api.setState('useCaseAction', 'KEEP');
            helpers.modal.open("[component-id$='revert_use_case_confirm']");
        }
    }
}
