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
    let contentTreeItems = [...api.state.contentTreeItems];
    let isPlaybookSourceTypeProject = false;
    if (contentTreeItems.length === 0 || contentTreeItems[0].id !== 'process-tables-view') {
        return;
    }

    const entities = api.data.get_project_entities.results;

    contentTreeItems.splice(1);
    contentTreeItems[0].children = [];
    const parentTableListItems = [];

    for (const entity of entities) {
        parentTableListItems.push({
            id: entity._row_data.uniqueValue,
            label: entity.table.displayValue,
            tableName: entity.table.value,
            sourceType: entity.source_type.value,
        });
        if (entity.source_type.value == "PLAYBOOK_DATA") {
            isPlaybookSourceTypeProject = true;
            api.setState('isPlaybookSourceTypeProject', true);
            // we know the fixed filter query for playbook projects..
            // ex: Process Definition Source = sys_Id^State = Complete^Archive =^Process Variant is empty^[extra-filteringQuery]
            const conditions = entity.filter.value.split('^');
            api.setState('playbookProjectFixedFilters', conditions.slice(0, 4).join('^'));
            api.setState('filterCondition', conditions.slice(4).join('^'));
        }
    }

    const entityItems = [];
    for (let i = 0; i < entities.length; i += 1) {
        const highlightedValue = !entities[i].parent_entity.value ? [{
            label: await helpers.translate('Primary'),
            status: 'moderate'
        }] : [];
        const children = [];
        if (isPlaybookSourceTypeProject) {
            // do not show filter conditions for child table
            if (!entities[i].parent_entity.value) {
                children.push({
                    id: `${entities[i]._row_data.uniqueValue}-filters`,
                    label: await helpers.translate('Filter conditions'),
                    entity: entities[i].table.value,
                    actionable: true,
                    entity: entities[i],
                });
                // always playbook fixed filters are not editable.
                // ex: 'Process Definition Source = Remediate server .and. State = Complete .and. Archive = .and. Process Variant is empty';
                // Split the string by ' .and. ' to get each key-value part
                const parts = entities[i].filter.displayValue.split(' .and. ');

                // Find the part that starts with 'Process Definition Source = '
                const sourcePart = parts.find(part => part.startsWith('Process Definition Source = '));

                if (sourcePart) {
                    // Split by '=' and trim to get the value
                    const processDefinitionSource = sourcePart.split('=')[1].trim();
                    api.setState('playbookDefinitionItem', [{ id: processDefinitionSource, label: processDefinitionSource }]);
                }
            }
        } else {
            children.push(...[
                {
                    id: `${entities[i]._row_data.uniqueValue}-filters`,
                    label: await helpers.translate('Filter conditions'),
                    entity: entities[i].table.value,
                    actionable: true,
                    entity: entities[i],
                },
                {
                    id: `${entities[i]._row_data.uniqueValue}-activities`,
                    label: await helpers.translate('Activities'),
                    entity: entities[i].table.value,
                    actionable: true,
                    entity: entities[i],
                }
            ]);
        }
        // playbook projects don't have the breakdowns
        if (!isPlaybookSourceTypeProject) {
            children.push({
                id: `${entities[i]._row_data.uniqueValue}-breakdowns`,
                label: await helpers.translate('Breakdowns'),
                entity: entities[i].table.value,
                actionable: true,
                entity: entities[i],
            });
        }
        if(!entities[i].parent_entity.value && !isPlaybookSourceTypeProject) {
            children.push({
                id: `${entities[i]._row_data.uniqueValue}-metrics`,
                label: await helpers.translate('Metrics'),
                entity: entities[i].table.value,
                actionable: true,
                entity: entities[i],
            });
            // define touch point messages
            const metricsMessages = {
                "configMissing": {
                    "header": await helpers.translate("{0} process configuration missing.", entities[i].table.displayValue),
                    "action": await helpers.translate("Create process configuration"),
                    "message": await helpers.translate("Metrics must be set up in the process configuration."),
                    "type": "warning"
                },
                "contactAdmin": await helpers.translate("Contact your Administrator."),
                "metricsMissing": {
                    "action": await helpers.translate("Set up metrics"),
                    "message": await helpers.translate("Metrics are not setup in the {0} process configuration.", entities[i].table.displayValue),
                    "type": "warning"
                },
                "outOfSync": {
                    "action" : await helpers.translate("Review process configuration"),
                    "touchpoints": await helpers.translate("Touchpoint metrics are out of sync with the {0} process configuration. Toggle the switch off and back on to update.", entities[i].table.displayValue),
                    "idletime": await helpers.translate("Idle time metrics are out of sync with the {0} process configuration. Toggle the switch off and back on to update.", entities[i].table.displayValue),
                    "type": "info"
                }
            };
            api.setState('metricsMessages', metricsMessages);
            api.setState('projectTouchPointsEnabled', entities[i].enable_touch_point.value);
            api.setState('projectIdleTimeEnabled', entities[i].enable_idle_time.value);
            
            if (api.state.processId) {
                api.data.get_touch_points_status_1.execute({
                    projectId: api.state.projectDetails._row_data.uniqueValue,
                    processId: api.state.processId,
                });
                api.data.get_idle_time_configuration_1.execute({
                    entityId: entities[i]._row_data.uniqueValue,
                    processId: api.state.processId,
                });
            }
            const entityUseCases = api.state.entityUseCasesMap[entities[i]._row_data.uniqueValue];
            let addUseCasesOption = true;
            if (entities[i].source_type.value === "AGENTIC_AI_DATA" && entityUseCases) {
                const allHidden = !entityUseCases.includeApprovals.visible && !entityUseCases.includeSLABreach.visible && Boolean(entityUseCases.childTables.length === 0);
                addUseCasesOption = !allHidden;
            }
            if (addUseCasesOption) {
                // show after Metrics in tree list
                children.push({
                    id: `${entities[i]._row_data.uniqueValue}-advanced-settings`,
                    label: await helpers.translate('Use cases'),
                    entity: entities[i].table.value,
                    actionable: true,
                    entity: entities[i],
                });
            }
        }
        if (isPlaybookSourceTypeProject) {
            if (!entities[i].parent_entity.value) {
                entityItems.push(prepareEntity(entities[i], highlightedValue, children));
            }
        } else {
            entityItems.push(prepareEntity(entities[i], highlightedValue, children));
        }
    }

    const tree = createTree(entityItems, null);

    contentTreeItems = contentTreeItems.concat(tree);

    const entityForm = { ...api.state.entityForm
    };
    entityForm.fields.parentEntity.listItems = parentTableListItems;
    api.setState('entityForm', entityForm);
    api.setState('contentTreeItems', contentTreeItems);
    // Expand the root entity in the tree
    api.setState('contentTreeExpandedItems', [
        [contentTreeItems[1].id]
    ]);
    api.setState('allEntities', entities);
    api.data.get_entities_by_project.execute({
        projectId: api.context.props.projectId,
    });

    const selectedEntity = { ...api.state.selectedEntity };
    if (selectedEntity?._row_data?.uniqueValue) {
        const entityId = api.state.entityId != "" ? api.state.entityId : selectedEntity._row_data.uniqueValue;
        const nodePath = findNodePath(contentTreeItems[1], entityId);
        api.setState('contentTreeExpandedItems', nodePath);
        if (api.state.entityId !== '') {
            api.setState('entityId', '');
        }
    }
    if(api.context.props.section) {
        const nodePath = findNodePath(contentTreeItems[1], contentTreeItems[1].id);
        api.setState('contentTreeExpandedItems', nodePath);
        api.setState('selectedContentTreeItem', [contentTreeItems[1].id, api.context.props.section]);

        let currentView = { ...api.state.currentView
        };
        currentView = {
            view: api.state.VIEWS.METRICS,
            params: {
                mode: '',
            },
        };
        api.setState('currentView', currentView);
        const entity = entities.find(entity => entity.parent_entity.value == null);
        api.setState('selectedEntity', entity);

        api.data.get_process_configuration.execute({
            table: entity.table.value
        });
    }
    api.data.get_transition_relation.execute({
        table: "promin_project_entity",
        column: "advanced_condition_relation",
    });
    api.data.get_advanced_condition_type.execute({
        table: "promin_project_entity",
        column: "advanced_condition_type",
    });

    function createTree(array, parentSysId = null) {
        const tree = [];

        for (const item of array) {
            if (item.parentSysId === parentSysId) {
                const children = createTree(array, item.sysId);
                if (children.length) {
                    item.children = item.children.concat(children);
                }
                tree.push(item);
            }
        }

        return tree;
    }

    function findNodePath(tree, selectedNodeId, currentPath = []) {
        // Base case: If the current tree node is null or undefined, return an empty array
        if (!tree) {
            return [];
        }

        // Add the current node's id to the path
        const pathWithCurrentNode = [...currentPath, tree.id];

        // If the current node's id matches the selectedNodeId, return the path
        if (tree.id === selectedNodeId) {
            return [pathWithCurrentNode];
        }

        // Recursively search in the children of the current node
        if (tree.children && tree.children.length > 0) {
            for (const child of tree.children) {
                const pathFromChild = findNodePath(child, selectedNodeId, pathWithCurrentNode);

                // If the path is found in the child, return it
                if (pathFromChild.length > 0) {
                    return [pathWithCurrentNode, ...pathFromChild];
                }
            }
        }

        // If the selected node is not found in the current subtree, return an empty array
        return [];
    }

    function prepareEntity(entity, highlightedValue, children) {
        return {
            id: entity._row_data.uniqueValue,
            label: entity.table.displayValue,
            fields: entity,
            sysId: entity._row_data.uniqueValue,
            parentSysId: entity.parent_entity.value,
            highlightedValueProps: highlightedValue,
            children: children,
        };
    }
}
