function handler({
    api,
    event,
    helpers,
    imports
}) {
    let rowPayload;
    const {
        item
    } = event.payload;
    const {
        props: {
            referenceTable,
            referenceKey,
            referenceField,
            fieldType
        }
    } = api.context;
    let newValue;
    let newDisplayValue;
    let newValues = [];
    let newDisplayValues = [];
    const removeItem = (arr, index) => {
        const clone = [...arr];
        clone.splice(index, 1);
        return clone;
    };
    const getRowClickedPayload = ({
        referenceField,
        value,
        sys_id,
        displayValue
    }) => ({
        referenceField,
        row: {
            referenceKeyValue: {
                value
            },
            sys_id: {
                value: sys_id
            },
            displayValue: {
                value: displayValue
            }
        }
    });

    if (referenceTable === item.class || referenceTable === 'cmdb_ci') {
        newValue = referenceKey ? item[referenceKey] : item.id;
        newDisplayValue = item.label;
    } else {
        newValue = item.parentId;
        newDisplayValue = item.parentLabel;
    }

    if (fieldType === 'glide_list') {
        if (referenceTable === item.class || referenceTable === 'cmdb_ci') {
            let selectedItem = api.state.clickedItems;
            let isSelected = false;
            for (let i = 0; i < selectedItem.value.length; i++) {
                if (newValue === selectedItem.value[i]) {
                    isSelected = true;
                    break;
                }
            }
            if (isSelected) {
                const index = api.state.clickedItems.value.indexOf(newValue);
                if (index >= 0) {
                    newValues = removeItem(api.state.clickedItems.value, index);
                    newDisplayValues = removeItem(
                        api.state.clickedItems.displayValue,
                        index
                    );
                }
            } else {
                newValues = [...api.state.clickedItems.value, newValue];
                newDisplayValues = [
                    ...api.state.clickedItems.displayValue,
                    newDisplayValue
                ];
            }
            api.setState('clickedItems', {
                value: newValues,
                displayValue: newDisplayValues
            });
        }
    } else {
        rowPayload = getRowClickedPayload({
            referenceField,
            value: newValue,
            sys_id: newValue,
            displayValue: newDisplayValue
        });
        if (rowPayload) {
            api.emit('REF_PICK#ROW_CLICKED', rowPayload);
            api.emit('MODAL_SELECTED_RELAY_d7f8b70dff13101035be517f793bf1e0', {
                showModal: false
            });
        }
    }
}
