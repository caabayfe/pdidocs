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
        cloneDeep
    } = imports['sn_cmdb_ws.CmdbWsCloneUtil']();

    const {
        currentSelections,
        currentAction
    } = api.state;
    // There is some issue where the selected item still gets added.
    // Noticed, if we set to null then the value we really want, it works fine.
    let selected = [...currentSelections];
    api.setState("currentSelections", null);

    const {
        isDisplayFieldSelection,
        restrictedFields
    } = api.context.props;
    
    if (isDisplayFieldSelection) {
        api.setState("currentAction", "displayFields");
    } else {
        api.setState("currentAction", "certificationFields");
    }

    const _mergeReferenceField = (field) => {
        var mergedFieldId = "";
        var mergedFieldLabel = "";
        for (var i = 0; i < field.length; i++) {
            mergedFieldId += field[i]["id"] + ".";
            mergedFieldLabel += field[i]["label"] + ".";
        }
        return {
            id: mergedFieldId.slice(0, -1),
            label: mergedFieldLabel.slice(0, -1),
        };
    };
    
    const _isFieldSelected = (previousFields, selectedItems) => {
        var fieldsArray = previousFields.split(',');

        for (var i = 0; i < selectedItems.length; i++) {
            var field;
            if (selectedItems[i].length == 1)
                field = selectedItems[i][0];
            else
                field = _mergeReferenceField(selectedItems[i]);

            if (fieldsArray.includes(field.id)) {
                return [true, field];
            }
        }

        return [false, {}];
    };
    
    const selectedFields = event.payload;
    let isselectionInvalid = _isFieldSelected(restrictedFields, selectedFields);
    
    if (isselectionInvalid[0]) {
        var contentText = "";
        if (isDisplayFieldSelection)
            contentText = await helpers.translate("The {0} field is part of selected certification fields and cannot be added to display fields", isselectionInvalid[1]["label"]);
        else
            contentText = await helpers.translate("The {0} field is part of selected display fields and cannot be added to certification fields", isselectionInvalid[1]["label"]);
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'alert1',
                status: 'critical',
                icon: 'info-circle-outline',
                content: contentText,
                action: {
                    type: 'dismiss'
                }
            }]
        });
        // Set the value to the previous selected. Need to set it in a timeout so it actually sets
        helpers.timing.setTimeout(() => {
            api.setState("currentSelections", selected);
        }, 1);
    } else {
        helpers.timing.setTimeout(() => {
            api.setState("currentSelections", selectedFields);
        }, 1);
    }

}
