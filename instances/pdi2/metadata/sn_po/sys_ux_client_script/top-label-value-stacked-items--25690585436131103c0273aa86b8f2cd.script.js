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
    const currentProjectEntities = [...api.state.currentProjectEntities];
    const currentEntity = api.item.value;
    const entity = api.state.projectData.projectEntities.find((entity) => entity.table.name === currentEntity.table.name);
    const sourceType = entity?.sourceType?.value;

    let items = [{
        id: 'DisplayName',
        label: helpers.translateSync('Display name'),
        value: {
            type: 'string',
            value: currentEntity.name || currentEntity.table.label,
        }
    }, {
        id: 'RelationType',
        label: helpers.translateSync('Relation type'),
        value: {
            type: 'string',
            value: currentEntity.parentId ? currentEntity.relationType.label : "-"
        }
    }];

    const parentEntityId = currentEntity.parentId;
    if (parentEntityId) {
        const parentEntity = allEntities.find(entity => entity.entityId === parentEntityId);
        items.push({
            id: 'ParentEntity',
            label: helpers.translateSync('Parent entity'),
            value: {
                type: 'string',
                value: parentEntity.name,
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

    if (api.state.isPlaybookSourceTypeProject) {
        if (!currentEntity.parentId) {
            const parentItemsToRemove = ["RelationType", "ParentEntity"];
            items = items.filter(item => !parentItemsToRemove.includes(item.id));
            items.push({
                id: 'FilterConditions',
                label: helpers.translateSync('Filter conditions'),
                value: {
                    type: 'string',
                    value: currentEntity.filter?.displayValue || '-',
                }
            });
            return items;
        }
        return items;
    }

    if (api.state.projectData.source.value === 'PA' || sourceType === "EXTERNAL_DATA" || sourceType === "ARCHIVED_DATA" || sourceType === "AGENTIC_AI_DATA") {
        items.push({
            label: '',
            value: {
                type: 'string',
                value: '',
            },
        });
        return items;
    }

    if (entity?.fixedCondition) {
        items.push({
            label: helpers.translateSync('Fixed filter'),
            value: {
                type: 'string',
                value: entity.fixedCondition?.displayValue || '-',
            }
        });
    } else if (entity?.reportSourceCondition) {
        items.push({
            label: helpers.translateSync('Report source'),
            value: {
                type: 'string',
                value: entity.reportSourceCondition?.displayValue || '-',
            }
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
