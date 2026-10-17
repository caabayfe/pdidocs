function script({
    api
}) {
    const {
        currentValue,
        displayValue,
        displayValueList,
        referenceField,
        fieldType
    } = api.context.props;
    const {
        value,
        displayValue: newDisplayValue
    } = api.state.clickedItems;
    const getRowClickedPayload = ({
        referenceField,
        value,
        displayValue
    }) => ({
        referenceField,
        row: {
            referenceKeyValue: {
                value
            },
            displayValue: {
                value: displayValue
            }
        }
    });

    const getMap = (value, displayValue) => {
        const obj = {};
        value.forEach((val, index) => (obj[val] = displayValue[index]));
        return obj;
    };
    const valueMap = {
        ...(currentValue ?
            getMap(currentValue.split(','), displayValueList || displayValue.split(',')) :
            {}),
        ...getMap(value, newDisplayValue)
    };

    const rowPayload = getRowClickedPayload({
        referenceField: referenceField,
        value: Object.keys(valueMap).join(','),
        displayValue: Object.values(valueMap)
    });

    if (rowPayload) {
        api.emit('REF_PICK#ROW_CLICKED', rowPayload);
    }
}
