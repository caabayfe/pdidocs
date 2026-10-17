function handler({
    api,
    event,
    helpers,
    imports
}) {
    let rowPayload;
    const newValue = event.payload.value;
    const newDisplayValue = event.payload.displayValue;
    const {
        value,
        displayValue
    } = api.state.selectedItems;
    const {
        fieldType,
        referenceField
    } = api.context.props;
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

    if (fieldType === 'glide_list') {
        const isSelected = event.payload.isSelected;
        if (!isSelected) {
            const newStateValue = value.filter(val => val !== event.payload.value);
            const newStateDisplayValue = displayValue.filter(
                val => val != event.payload.displayValue
            );
            api.setState('selectedItems', {
                value: newStateValue,
                displayValue: newStateDisplayValue
            });
        } else {
            const newStateValue = [...value, event.payload.value];
            const newStateDisplayValue = [
                ...displayValue,
                event.payload.displayValue
            ];
            api.setState('selectedItems', {
                value: newStateValue,
                displayValue: newStateDisplayValue
            });
        }
    } else {
        rowPayload = getRowClickedPayload({
            referenceField,
            value: newValue,
            sys_id: event.payload.value,
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
