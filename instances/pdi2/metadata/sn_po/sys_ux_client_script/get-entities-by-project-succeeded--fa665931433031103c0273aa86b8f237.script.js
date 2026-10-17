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
    const { ACTIVITY_TYPES } = api.state;
    const entities = event.payload.data.output.data.GlidePromin_Query.projectConfiguration.projectEntities;
    const contentTreeItems = [...api.state.contentTreeItems];
    contentTreeItems[0].label = await helpers.translate('Overview');
    const tree = contentTreeItems[1];

    const entityTables = [];
    let parentTable;
    for (const entity of entities) {
        if(entity.parentId == null){
            parentTable = entity.table.name;
        }
        entityTables.push(entity.table.name);
        const payload = {
            filtersCount: getFiltersCount(entity.filter.value) + getCropConditionsCount(entity),
            activitiesCount: entity.activities.filter(ac => ac.fieldType !== 'PROCESS_STEP').length + entity.activitiesOfInterest.length,
            breakdownsCount: entity.breakdowns.length,
            advancedSettingsComplete: entity.includeApprovals,
        };
        if (!entity.parentId) {
            if (api.state.processId) {
                api.data.get_touch_points_status_1.execute({
                    projectId: api.state.projectDetails._row_data.uniqueValue,
                    processId: api.state.processId,
                });
                api.data.get_idle_time_configuration_1.execute({
                    entityId: entity.entityId,
                    processId: api.state.processId,
                });
            }
            const touchPointsCount = entity.touchPointEnabled ? 1 : 0;
            const idleTimeCount = api.state.projectIdleTimeEnabled ? 1 : 0;
            payload.metricsCount = touchPointsCount + idleTimeCount;
        }
        mutateNode(tree, entity.entityId, payload);
    }

    api.setState('contentTreeItems', contentTreeItems);
    api.setState('entityCardRepeaterData', entities);

    if(parentTable) {
        api.data.get_process_configuration_for_activity.execute({
            table: parentTable
        });
    }
    api.data.check_sla_breach_analysis_visibility.execute({
        'tableNames': entityTables.join(','),
    });
    api.data.get_use_cases_state.execute({
        projectId: api.context.props.projectId,
    });
    api.data.is_scope_analysis_stage_enabled.refresh();

    async function mutateNode(tree, targetId, payload) {
        if (tree.sysId === targetId) {
            // Object.assign(tree, newData);
            for (let i = 0; i < tree.children.length; i += 1) {
                if (tree.children[i].id === `${tree.sysId}-filters`) {
                    tree.children[i].statuses = [{
                        type: "badge",
                        value: payload.filtersCount,
                        round: true,
                        status: 'low'
                    }];
                } else if (tree.children[i].id === `${tree.sysId}-activities`) {
                    const activitiesLabel = await helpers.translate('Activities');
                    tree.children[i].label = `${activitiesLabel}*`;
                    tree.children[i].statuses = [{
                        type: "badge",
                        value: payload.activitiesCount,
                        round: true,
                        status: 'low'
                    }];
                } else if (tree.children[i].id === `${tree.sysId}-breakdowns`) {
                    tree.children[i].statuses = [{
                        type: "badge",
                        value: payload.breakdownsCount,
                        round: true,
                        status: 'low'
                    }];
                } else if (tree.children[i].id === `${tree.sysId}-advanced-settings`) {
                    tree.children[i].statuses = [{
                        type: "badge",
                        value: payload.advancedSettingsComplete ? 1 : 0,
                        round: true,
                        status: 'low'
                    }];
                } else if (tree.children[i].id === `${tree.sysId}-metrics`) {
                    tree.children[i].statuses = [{
                        type: "badge",
                        value: payload.metricsCount,
                        round: true,
                        status: 'low'
                    }];
                }
            }
        } else if (tree.children) {
            // Recursively search for the target node in children
            for (const child of tree.children) {
                mutateNode(child, targetId, payload);
            }
        }
    }

    function getFiltersCount(filterStr) {
        if (!filterStr) {
            return 0;
        }
        let count = 0;
        for (let i = 0; i < filterStr.length; i++) {
            if (filterStr[i] === '^') {
                count++;
            }
        }
        return count + 1;
    }

    function getCropConditionsCount(entity) {
        let count = 0;
        if (entity.customStartCondition && Object.keys(entity.customStartCondition).length > 0) {
            count += 1;
        }
        if (entity.customStopCondition && Object.keys(entity.customStopCondition).length > 0) {
            count += 1;
        }

        return count;
    }
    
}
