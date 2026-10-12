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
    const contentTreeItems = [...api.state.contentTreeItems];
    const parentIds = getParentIds(event.payload.item.id, contentTreeItems.slice(1));
    const contentTreeSelectedIds = [...parentIds, event.payload.item.id];
    api.setState('selectedContentTreeItem', contentTreeSelectedIds);

    // Reset filter condition when navigating to different items in the content tree
    api.setState('filterCondition', null);

    if (event.payload.item.id.includes('filters')) {
        const selectedEntityFields = event.payload.item.entity;
        let inputFilters = selectedEntityFields.filter.value || "";
        const entityForm = { ...api.state.entityForm };
        const isParentEntity = !Boolean(selectedEntityFields.parent_entity.value);
        const { REPORT_SOURCE, EXTERNAL_DATA } = api.state.SOURCE_TYPES;
        const showEntityName = selectedEntityFields.source_type.value === REPORT_SOURCE || selectedEntityFields.source_type.value === EXTERNAL_DATA;
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
                    "inputValue": showEntityName
                        ? selectedEntityFields.name.displayValue
                        : selectedEntityFields.table.displayValue,
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
                }
            },
        });
        api.setState('hideParentADsWarning', true);
        api.setState('filterCondition', inputFilters);
        if (event.payload.item.entity.source_type.value == "PLAYBOOK_DATA") {
            // we know the fixed filter query for playbook projects..
            // ex: Process Definition Source = sys_Id^State = Complete^Archive =^Process Variant is empty^[extra-filteringQuery]
            const conditions = event.payload.item.entity.filter.value.split('^');
            if (conditions.length > 0 && event.payload.item.entity.filter.value.includes("process_definition.source")) {
                api.setState('filterCondition', conditions.slice(4).join('^'));
            }
        }

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

        const entityId = selectedEntityFields._row_data.uniqueValue;
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
        api.data.get_project_details_1.refresh();
    } else if (event.payload.item.id.includes('activities')) {
        let currentView = { ...api.state.currentView
        };
        currentView = {
            view: api.state.VIEWS.ACTIVITIES_LIST,
            params: {
                mode: '',
            },
        };
        api.setState('activitiesListSelectedRecords', []);
        api.setState('currentView', currentView);
        api.setState('selectedEntity', event.payload.item.entity);
        // Refresh activities list
        api.setState('activitiesListRefreshState', {
            timestamp: Date.now(),
            background: false,
        });
        api.data.get_process_configuration.execute({
            table: event.payload.item.entity.table.value
        });
    } else if (event.payload.item.id.includes('breakdowns')) {
        let currentView = { ...api.state.currentView
        };
        currentView = {
            view: api.state.VIEWS.BREAKDOWNS_LIST,
            params: {
                mode: '',
            },
        };
        api.setState('breakdownsListSelectedRecords', []);
        api.setState('currentView', currentView);
        api.setState('selectedEntity', event.payload.item.entity);
        api.data.get_process_configuration.execute({
            table: event.payload.item.entity.table.value
        });
    } else if (event.payload.item.id.includes('process-tables-view')) {
        let currentView = { ...api.state.currentView
        };
        currentView = {
            view: api.state.VIEWS.LANDING_PAGE,
            params: {
                mode: '',
            },
        };
        api.setState('currentView', currentView);
    } else if (event.payload.item.id.includes('advanced-settings')) {
        api.setState('resizablePanesDividerPosition', '-48px');
        const currentEntity = event.payload.item.entity;
        let entityForm = { ...api.state.entityForm
        };
        if (!entityForm.fields.includeApprovals) {
            entityForm.fields.includeApprovals = {};
        }
        if (!entityForm.fields.slaBreachAnalysis) {
            entityForm.fields.slaBreachAnalysis = {};
        }
        entityForm.fields.slaBreachAnalysis.visible = api.state.slaVisibilityMap[currentEntity.table.value];
        entityForm.fields.includeApprovals.value = false;
        let currentView = { ...api.state.currentView
        };
        currentView = {
            view: api.state.VIEWS.ADVANCED_CONDITION,
            params: {
                mode: '',
            },
        };
        api.setState('currentView', currentView);
        api.setState('selectedEntity', event.payload.item.entity);
        api.setState('entityForm', entityForm);

        api.data.check_approval_analysis_visibility.execute({
            table: event.payload.item.entity.table.value,
            sourceType: event.payload.item.entity.source_type.value,
        });

        api.data.get_process_configuration.execute({
            table: event.payload.item.entity.table.value
        });
    } else if (event.payload.item.id.includes('metrics')) {
        let currentView = { ...api.state.currentView
        };
        currentView = {
            view: api.state.VIEWS.METRICS,
            params: {
                mode: '',
            },
        };
        api.setState('currentView', currentView);
        api.setState('selectedEntity', event.payload.item.entity);

        api.data.get_process_configuration.execute({
            table: event.payload.item.entity.table.value
        });
    }

    if (event.payload.item.entity.source_type.value === api.state.SOURCE_TYPES.AGENTIC_AI_DATA) {
        api.data.get_ai_agent_task_type_choice_fields.execute({
            table: 'sn_aia_execution_task',
            column: 'type'
        });
    }

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
