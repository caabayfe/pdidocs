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
    const entityForm = { ...api.state.entityForm
    };
    const currentView = { ...api.state.currentView
    };

    const missingFields = [];
    let isParentEntity = false;
    const isEditMode = currentView.params.mode === 'EDIT' ? true : false;
    if (isEditMode && !api.state.selectedEntity.parent_entity.value) {
        isParentEntity = true;
    }

    if (!entityForm.fields.sourceType.selectedValue) {
        entityForm.fields.sourceType.invalid = true;
        missingFields.push(await helpers.translate('Source type'));
    }
    if (!entityForm.fields.entity.tableName) {
        entityForm.fields.entity.invalid = true;
        missingFields.push(await helpers.translate('Table'));
    }
    if (!isParentEntity && !entityForm.fields.parentEntity.selectedValue) {
        entityForm.fields.parentEntity.invalid = true;
        missingFields.push(await helpers.translate('Parent table'));
    }
    if (!isParentEntity && !entityForm.fields.relationType.selectedValue) {
        entityForm.fields.relationType.invalid = true;
        missingFields.push(await helpers.translate('Relation'));
    }
    if (!isParentEntity && !entityForm.fields.sourceField.selectedValue) {
        entityForm.fields.sourceField.invalid = true;
        missingFields.push(await helpers.translate('Source field'));
    }
    if (!isParentEntity && !entityForm.fields.targetField.selectedValue) {
        entityForm.fields.targetField.invalid = true;
        missingFields.push(await helpers.translate('Target field'));
    }

    api.setState('entityForm', entityForm);

    if (missingFields.length > 0) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'create-promin-entity-error',
                status: 'critical',
                icon: 'exclamation-triangle-outline',
                content: await helpers.translate('The following mandatory fields are not filled in: {0}', missingFields.join(', ')),
                action: {
                    type: 'dismiss'
                },
            }],
        });

        if (api.state.selectedStage !== 'scope-your-analysis') {
            // Timeout is needed, otherwise stepper state does not visually update
            helpers.timing.setTimeout(() => {
                api.setState('selectedStage', 'scope-your-analysis');
            }, 500);
        }

        return;
    }

    const advancedConditionForm = { ...api.state.advancedConditionForm
    };
    if (
        (advancedConditionForm.fields.startCondition.id === advancedConditionForm.fields.endCondition.id) &&
        (advancedConditionForm.fields.startCondition.id)
    ) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'advanced-condition-error',
                status: 'critical',
                icon: 'exclamation-triangle-outline',
                content: await helpers.translate('Start and end condition cannot be the same'),
                action: {
                    type: 'dismiss'
                },
            }],
        });
        return;
    }
    const message = await helpers.translate('Both Process start / end condition are mandatory for type "Transition"');
    if (!advancedConditionForm.fields.startCondition.id && !advancedConditionForm.fields.endCondition.id) {
        if (advancedConditionForm.fields.transitionConditionType == 'TRANSITION') {
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [{
                    id: 'advanced-condition-error',
                    status: 'critical',
                    icon: 'exclamation-triangle-outline',
                    content: message,
                    action: {
                        type: 'dismiss'
                    },
                }],
            });
            return;
        }
        advancedConditionForm.fields.transitionConditionType = "NONE";
        advancedConditionForm.fields.advancedConditionRelation = "NONE";
    } else {
        if (advancedConditionForm.fields.transitionConditionType == '' || advancedConditionForm.fields.transitionConditionType == 'NONE') {
            //transitionConditionType cannot be blank, default to CROP
            advancedConditionForm.fields.transitionConditionType = "CROP";
            advancedConditionForm.fields.advancedConditionRelation = "EVENTUALLY_FOLLOWED_BY";

        } else if (advancedConditionForm.fields.transitionConditionType == 'CROP') {
            //If the transitionConditionType is CROP, advancedConditionRelation defaults to EVENTUALLY_FOLLOWED_BY
            advancedConditionForm.fields.advancedConditionRelation = "EVENTUALLY_FOLLOWED_BY";
        } else if (advancedConditionForm.fields.transitionConditionType == 'TRANSITION') {
            if (!advancedConditionForm.fields.startCondition.id || !advancedConditionForm.fields.endCondition.id) {
                api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                    items: [{
                        id: 'advanced-condition-error',
                        status: 'critical',
                        icon: 'exclamation-triangle-outline',
                        content: message,
                        action: {
                            type: 'dismiss'
                        },
                    }],
                });
                return;
            }
            //If the advancedConditionRelation is empty, transitions defaults to EVENTUALLY_FOLLOWED_BY
            if (advancedConditionForm.fields.advancedConditionRelation == null) {
                advancedConditionForm.fields.advancedConditionRelation = "EVENTUALLY_FOLLOWED_BY";
            }
        }
    }

    let reportSource = null;
    if (entityForm.fields.sourceType.selectedValue === 'REPORT_SOURCE') {
        reportSource = entityForm.fields.entity.selectedValue;
    }

    let externalDataset = null;
    if (entityForm.fields.sourceType.selectedValue === 'EXTERNAL_DATA') {
        externalDataset = entityForm.fields.entity.selectedValue;
    }

    const entityName = entityForm.fields.entity.inputValue.split('[')[0].trim();
    const entityPayload = JSON.stringify({
        project: api.context.props.projectId,
        name: entityName,
        table: entityForm.fields.entity.tableName,
        parent_entity: entityForm.fields.parentEntity.selectedValue,
        relation_type: entityForm.fields.relationType.selectedValue,
        source_field: entityForm.fields.sourceField.selectedValue,
        target_field: entityForm.fields.targetField.selectedValue,
        filter: entityForm.fields.filter.value,
        source_type: entityForm.fields.sourceType.selectedValue,
        report_source: reportSource,
        external_dataset: externalDataset,
        custom_start_condition: advancedConditionForm.fields.startCondition.id,
        custom_end_condition: advancedConditionForm.fields.endCondition.id,
        advanced_condition_relation: advancedConditionForm.fields.advancedConditionRelation,
        advanced_condition_type: advancedConditionForm.fields.transitionConditionType
    });

    if (isEditMode) {
        api.data.update_promin_entity.execute({
            sysId: api.state.selectedEntity._row_data.uniqueValue,
            entityPayload,
        });
    } else {
        api.data.create_promin_entity.execute({
            entityPayload,
        });
    }
    api.setState('selectedContentTreeItem', ['process-tables-view']);
}
