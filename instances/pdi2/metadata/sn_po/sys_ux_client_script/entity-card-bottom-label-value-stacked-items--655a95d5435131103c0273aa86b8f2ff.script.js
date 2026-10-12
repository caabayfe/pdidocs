/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const {
        isPlaybookSourceTypeProject
    } = api.state;
    const allEntities = [...api.state.allEntities];
    const currentEntity = api.item.value;
    const currentEntityTableData = allEntities.find(entity => entity._row_data.uniqueValue === currentEntity.entityId);
    if (!currentEntityTableData) {
        return {};
    }
    const customStartCondition = currentEntityTableData.custom_start_condition.displayValue || '-';
    const customEndCondition = currentEntityTableData.custom_end_condition.displayValue || '-';
    const relation = currentEntityTableData.advanced_condition_relation.displayValue || '-';
    const conditionType = currentEntityTableData.advanced_condition_type.value || 'NONE';
    // if playbook source type, entity has only activities.nothing else 
    if (isPlaybookSourceTypeProject) {
        return [];
    }
    const items = [{
            label: '',
            value: {
                type: 'string',
                value: '',
            },
        },
        {
            label: helpers.translateSync('Activity definitions'),
            value: {
                type: 'string',
                value: currentEntity.activities.map(activity => activity.displayName || activity.label).join(', ') || '-',
            }
        },
        {
            label: helpers.translateSync('Breakdowns'),
            value: {
                type: 'string',
                value: currentEntity.breakdowns.map(breakdown => breakdown.displayName || breakdown.fieldLabel).join(', ') || '-',
            }
        }
    ];
    const parentEntityId = currentEntity.parentId;
    if (!parentEntityId) {
        let label = '';
        let value;
        if (conditionType == 'CROP') {
            label = helpers.translateSync('Crop conditions');
            value = {
                type: 'string',
                value: customStartCondition === '-' && customEndCondition === '-' ?
                    '-' : `${customStartCondition}, ${customEndCondition}`,
            };
        } else if (conditionType == 'TRANSITION') {
            label = helpers.translateSync('Transition conditions');
            value = {
                type: 'string',
                value: customStartCondition === '-' && customEndCondition === '-' && relation === '' ?
                    '-' : `${customStartCondition} ${relation} ${customEndCondition}`,
            };
        } else {
            label = helpers.translateSync('Crop/Transition conditions');
            value = {
                type: 'string',
                value: '-'
            };
        }
        items.push({
            label,
            value
        });
    } else {
        items.push({
            label: '',
            value: {
                type: 'string',
                value: '',
            },
        });
    }
    return items;
}
