/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const allEntities = [...api.state.entityCardRepeaterData];
    const allEntitiesTableData = [...api.state.allEntities];
    const currentEntity = api.item.value;
    let items = [{
            id: 'TableName',
            label: helpers.translateSync('Table name'),
            value: {
                type: 'string',
                value: currentEntity.table.label,
            }
        },
        {
            id: 'RelationType',
            label: helpers.translateSync('Relation type'),
            value: {
                type: 'string',
                value: currentEntity.parentId ? currentEntity.relationType.label : '-',
            }
        }
    ];
    const parentEntityId = currentEntity.parentId;
    if (parentEntityId) {
        const parentEntity = allEntities.find(entity => entity.entityId === parentEntityId);
        items.push({
            id: 'ParentEntity',
            label: helpers.translateSync('Parent entity'),
            value: {
                type: 'string',
                value: parentEntity.table.label,
            },
        });
    } else {
        items.push({
            id: 'ParentEntity',
            label: helpers.translateSync('Parent entity'),
            value: {
                type: 'string',
                value: '-',
            },
        });
    }
    // hide child entity filter conditions for playbook datasource
    if (api.state.isPlaybookSourceTypeProject) {
        if (parentEntityId) {
            return items;
        }
        items = items.filter(item => !['ParentEntity', 'RelationType'].includes(item.id));
    }
    
    items.push({
        id: 'FilterConditions',
        label: helpers.translateSync('Filter conditions'),
        value: {
            type: 'string',
            value: allEntitiesTableData.find(entity => entity._row_data.uniqueValue === currentEntity.entityId).filter.displayValue || '-',
        }
    });

    return items;
}
