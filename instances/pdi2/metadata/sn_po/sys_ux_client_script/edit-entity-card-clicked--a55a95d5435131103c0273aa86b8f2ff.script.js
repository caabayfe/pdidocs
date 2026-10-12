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
    const selectedEntityCardId = event.context.item.value.entityId;
    if (!selectedEntityCardId) {
        return;
    }
    const allEntities = [...api.state.allEntities];
    const selectedEntityFields = allEntities.find(entity => entity._row_data.uniqueValue === selectedEntityCardId);
    if (!selectedEntityFields) {
        return;
    }
    const entityForm = { ...api.state.entityForm
    };
    const isParentEntity = !Boolean(selectedEntityFields.parent_entity.value);
    let inputFilters = selectedEntityFields.filter.value || "";
    if (api.state.isPlaybookSourceTypeProject) {
        // we know the fixed filter query for playbook projects..
        // ex: Process Definition Source = sys_Id^State = Complete^Archive =^Process Variant is empty^[extra-filteringQuery]
        const conditions = selectedEntityFields.filter.value.split('^');
        // take [extra-filteringQuery] encoded query for further customization. always fixed filters query is not editable
        inputFilters = conditions.slice(4).join('^');
    }
    api.setState('filterCondition', inputFilters);

    api.setState('entityForm', {
        "fields": {
            "sourceType": {
                "selectedValue": selectedEntityFields.source_type.value,
                "listItems": entityForm.fields.sourceType.listItems,
                "invalid": false,
                "disabled": true,
            },
            "entity": {
                "selectedValue": selectedEntityFields.table.value,
                "listItems": [],
                "inputValue": selectedEntityFields.table.displayValue,
                "invalid": false,
                "disabled": true,
                "tableName": selectedEntityFields.table.value,
            },
            "parentEntity": {
                "selectedValue": selectedEntityFields.parent_entity.value,
                "listItems": entityForm.fields.parentEntity.listItems,
                "invalid": false,
                "tableName": selectedEntityFields.parent_entity._reference.table.value,
                "disabled": isParentEntity ? true : false,
                "sourceType": selectedEntityFields.parent_entity._reference.source_type.value,
            },
            "relationType": {
                "selectedValue": selectedEntityFields.relation_type.value,
                "listItems": entityForm.fields.relationType.listItems,
                "invalid": false,
                "disabled": isParentEntity ? true : false,
            },
            "relationField": {
                "selectedValue": selectedEntityFields.relation_type.value === 'CHILD' ? selectedEntityFields.source_field.value : selectedEntityFields.target_field.value,
                "listItems": [],
                "invalid": false,
                "disabled": isParentEntity ? true : false,
            },
            "filter": {
                "value": inputFilters,
            },
            "includeApprovals": {
                "value": selectedEntityFields.include_approvals?.value
            },
            "sourceField": {
                "disabled": true,
                "invalid": false,
                "listItems": [],
                "selectedValue": selectedEntityFields.source_field.value,
            },
            "targetField": {
                "disabled": true,
                "invalid": false,
                "listItems": [],
                "selectedValue": selectedEntityFields.target_field.value,
            },
        },
    });
    api.setState('hideParentADsWarning', true);

     if (selectedEntityFields.parent_entity.value) {
        api.data.get_tables_reference_fields.execute({
            currentEntityTable: selectedEntityFields.table.value,
            referenceEntityTable: selectedEntityFields.parent_entity._reference.table.value,
            relationType: selectedEntityFields.relation_type.value,
            parentEntitySource: selectedEntityFields.parent_entity._reference.source_type.value,
            childEntitySource: selectedEntityFields.source_type.value,
        });
    }
    let advancedConditionForm = { ...api.state.advancedConditionForm
    };
    advancedConditionForm.fields.startCondition.id = selectedEntityFields.custom_start_condition.value;
    advancedConditionForm.fields.startCondition.value = selectedEntityFields.custom_start_condition.displayValue;
    advancedConditionForm.fields.endCondition.id = selectedEntityFields.custom_end_condition.value;
    advancedConditionForm.fields.endCondition.value = selectedEntityFields.custom_end_condition.displayValue;
    advancedConditionForm.fields.advancedConditionRelation = selectedEntityFields.advanced_condition_relation.value;
    advancedConditionForm.fields.transitionConditionType = selectedEntityFields.advanced_condition_type.value || 'NONE';
    
    api.setState('advancedConditionForm', advancedConditionForm);

    const entityId = selectedEntityCardId;
    const entityCardRepeaterData = [...api.state.entityCardRepeaterData];
    const childEntityIds = findEntityIdsWithParent(entityId, entityCardRepeaterData);
    api.setState('selectedEntityCardId', [entityId, ...childEntityIds]);

    let currentView = { ...api.state.currentView
    };
    currentView = {
        view: api.state.VIEWS.ENTITY_FORM,
        params: {
            mode: 'EDIT',
        },
    };
    api.setState('currentView', currentView);
    api.setState('selectedEntity', selectedEntityFields);
    api.data.get_project_entities.refresh();

    if (selectedEntityFields.source_type.value === api.state.SOURCE_TYPES.AGENTIC_AI_DATA) {
        api.data.get_ai_agent_task_type_choice_fields.execute({
            table: 'sn_aia_execution_task',
            column: 'type'
        });
    }

    const contentTreeItems = [...api.state.contentTreeItems];
    const parentIds = getParentIds(selectedEntityCardId, contentTreeItems.slice(1));
    const contentTreeSelectedIds = [...parentIds, selectedEntityCardId];
    api.setState('selectedContentTreeItem', contentTreeSelectedIds);

    function getParentIds(nodeId, tree) {
        const parentIds = [];

        function findParents(node, targetId, parents) {
            if (node.id === targetId) {
                parentIds.push(...parents);
            } else if (node.children) {
                for (const childNode of node.children) {
                    findParents(childNode, targetId, [...parents, node.id]);
                }
            }
        }

        for (const node of tree) {
            findParents(node, nodeId, []);
        }

        return parentIds;
    }

    function findEntityIdsWithParent(inputEntityId, data) {
        const matchingEntityIds = [];
        function findChildren(entityId) {
            for (const item of data) {
                if (item.parentId === entityId) {
                    matchingEntityIds.push(item.entityId);
                    findChildren(item.entityId); // Recursively search for children
                }
            }
        }
        findChildren(inputEntityId); // Start the recursive search
        return matchingEntityIds;
    }
}
