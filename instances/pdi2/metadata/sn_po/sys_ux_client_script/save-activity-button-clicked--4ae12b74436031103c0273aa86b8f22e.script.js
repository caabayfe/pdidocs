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
    const { 
        idleTimeConfiguration,
        projectIdleTimeEnabled,
        selectedEntity,
        processId
    } = api.state;

    let activityForm = { ...api.state.activityForm
    };
    const currentView = { ...api.state.currentView
    };

    const isEditMode = currentView.params.mode === 'EDIT' ? true : false;
    const dotWalkMode = activityForm.fields.dotWalkMode;

    const missingFields = [];
    const fixFields = [];

    if (!activityForm.fields.type.selectedValue || activityForm.fields.type.selectedValue === 'null') {
        activityForm.fields.type.invalid = true;
        missingFields.push(await helpers.translate('Type'));
    }

    if (activityForm.fields.displayOrder.invalid) {
        fixFields.push(await helpers.translate('Display order'));
    }

    if (
        (
            activityForm.fields.type.selectedValue === api.state.ACTIVITY_TYPES.DEFAULT ||
            activityForm.fields.type.selectedValue === api.state.ACTIVITY_TYPES.DATE_TIME
        ) && !dotWalkMode && !activityForm.fields.relation.selectedValue
    ) {
        activityForm.fields.relation.invalid = true;
        missingFields.push(await helpers.translate('Field'));
    }

    if (
        (
            activityForm.fields.type.selectedValue === api.state.ACTIVITY_TYPES.DEFAULT ||
            activityForm.fields.type.selectedValue === api.state.ACTIVITY_TYPES.DATE_TIME
        ) && dotWalkMode && !activityForm.fields.dotWalkInput.value
    ) {
        activityForm.fields.dotWalkInput.invalid = true;
        missingFields.push(await helpers.translate('Field'));
    }

    if (dotWalkMode && activityForm.fields.type.selectedValue === api.state.ACTIVITY_TYPES.DEFAULT && !activityForm.fields.name.value) {
        // Display name is mandatory field in dotwalk mode
        activityForm.fields.name.invalid = true;
        missingFields.push(await helpers.translate('Display name'));
    }

    if (activityForm.fields.groupValues.value === 'group-unique-values' && !activityForm.fields.groupedActivityName.value) {
        activityForm.fields.groupedActivityName.invalid = true;
        missingFields.push(await helpers.translate('Grouped Activities name'));
    }

    if ((activityForm.fields.type.selectedValue === api.state.ACTIVITY_TYPES.PARENT_ATTACHED || activityForm.fields.type.selectedValue === api.state.ACTIVITY_TYPES.CHILD_ATTACHED) && !activityForm.fields.attachedTableConfiguration.selectedValue) {
        activityForm.fields.attachedTableConfiguration.invalid = true;
        missingFields.push(await helpers.translate('Attached Table Configuration'));
    }

    if (missingFields.length > 0 || fixFields.length > 0) {
        api.setState('activityForm', activityForm);
        const messages = [];
        const missingItems = {
            id: 'save-activity-error',
            status: 'critical',
            icon: 'exclamation-triangle-outline',
            content: await helpers.translate('The following mandatory fields are not filled in: {0}', missingFields.join(', ')),
            action: {
                type: 'dismiss'
            },
        };
        const fixItems = {
            id: 'save-activity-error',
            status: 'critical',
            icon: 'exclamation-triangle-outline',
            content: await helpers.translate('Please fix the following fields: {0}', fixFields.join(', ')),
            action: {
                type: 'dismiss'
            },
        };
        if (missingFields.length > 0) {
            messages.push(missingItems);
        }
        if (fixFields.length > 0) {
            messages.push(fixItems);
        }
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: messages,
        });

        if (api.state.selectedStage !== 'scope-your-analysis') {
            // Timeout is needed, otherwise stepper state does not visually update
            helpers.timing.setTimeout(() => {
                api.setState('selectedStage', 'scope-your-analysis');
            }, 500);
        }
        return;
    }

    // Compound activity should contain 2 or more fields
    if (activityForm.fields.type.selectedValue === api.state.ACTIVITY_TYPES.COMPOUND && (!activityForm.fields.relation.selectedValue || !activityForm.fields.relation.selectedValue.includes(','))) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'save-activity-error',
                status: 'critical',
                icon: 'exclamation-triangle-outline',
                content: await helpers.translate('Activity of type "Compound" cannot be created on single field. Please choose atleast 2 or more fields.'),
                action: {
                    type: 'dismiss'
                },
            }],
        });
        return;
    }

    let fieldValues = '';
    let fieldDisplayValues = '';
    if (api.state.selectedActivityFieldDetails && api.state.selectedActivityFieldDetails.internalType === 'boolean') {
        if (activityForm.fields.activityValues.selectedValues.length > 0) {
            if (activityForm.fields.activityValues.selectedValues[0]) {
                fieldValues = '1';
                fieldDisplayValues = 'true';
            } else {
                fieldValues = '0';
                fieldDisplayValues = 'false';
            }
        }
    } else {
        if (activityForm.fields.activityValues.selectedValues.length > 0) {
            fieldValues = activityForm.fields.activityValues.selectedValues.map(v => {
                if (v.id !== 'null') {
                    return v.id;
                }
                // This is how backend denotes empty activity field values
                return '[empty]';
            }).join(',');
            fieldDisplayValues = activityForm.fields.activityValues.selectedValuesLabels.join(',');
        }
    }

    const activityPayload = {
        entity: api.state.selectedEntity._row_data.uniqueValue,
        display_name: activityForm.fields.name.value || '',
        type: activityForm.fields.type.selectedValue,
        field: !activityForm.fields.dotWalkMode ? activityForm.fields.relation.selectedValue : activityForm.fields.dotWalkInput.value,
        activity_of_interest: activityForm.fields.hideActivity.value,
        track_change: activityForm.fields.groupValues.value === 'group-unique-values' ? true : false,
        field_display_values: fieldDisplayValues,
        field_values: fieldValues,
        field_values_selection_type: activityForm.fields.activityValuesChoice,
        change_name: activityForm.fields.groupedActivityName.value,
        attached_entity: activityForm.fields.attachedTableConfiguration.selectedValue,
        include_empty_start_node: activityForm.fields.includeEmptyStartNode.value,
        display_order: Number(activityForm.fields.displayOrder.value)
    };

    if (isEditMode && projectIdleTimeEnabled && event.elementId !== "confirm_idle_time_metric_change") {
        const isExistsInIdleTimeConfig = idleTimeConfiguration.projectActivityDefinitions.some(pad => pad.sysId === api.state.selectedActivityID);
        const idleTimeMetricViolation = isExistsInIdleTimeConfig && (activityPayload.type === "COMPOUND" || activityPayload.track_change);

        if (idleTimeMetricViolation) {
            //return the confirmation modal
            return helpers.modal.open("[component-id$='confirm_idle_time_metric_change']");
        }
    }

    if(event.elementId === "confirm_idle_time_metric_change") {
        const params = {
            value: false,
            entityId: selectedEntity._row_data.uniqueValue,
            processId: processId,
            fields: ""
        };

        api.data.include_idle_time_for_project.execute({
            payload: params
        });
    }

    if (isEditMode) {
        api.data.update_promin_activity.execute({
            sysId: api.state.selectedActivityID,
            activityPayload: JSON.stringify(activityPayload),
        });
    } else {
        api.data.create_promin_activity.execute({
            activityPayload: JSON.stringify(activityPayload),
        });
    }
    api.setState('selectedActivityValues', []);
}
