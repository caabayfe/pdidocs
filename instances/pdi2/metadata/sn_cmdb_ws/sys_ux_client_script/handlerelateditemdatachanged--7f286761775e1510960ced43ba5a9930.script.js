function script({ api, event, helpers, imports }) {
    //handleRelatedItemDataChanged script in Related Items UI controller; event fired after getRelatedItemData controller returns with related items details data
    
    const data = api.context.props.relatedItemData;
    const items = [];
    if (!data || data.length === 0 || Object.keys(data).length === 0) {
        // page may not have initialized yet
        api.setState('relatedItemRecords', items);
        api.setState('showDetailView', false);
        return;
    }
    // translate the data for display on related item details cards
    data.forEach(function (record) {
        var fieldLabelValueArray = [];
        for (var index = 0; index < record.fields.length; index++) {
            var field = record.fields[index];
            if (index === 1 && record.fields.length % 2 != 0) {
                // odd number of items, insert a blank spacer into the second column of the first row
                fieldLabelValueArray.push([{
                    label: "",
                    value: {}
                }]);
            }
            var isHighlightedValueType = Object.keys(field.highlightedStyle).length > 0;
            var fieldForComponent = {
                label: field.label,
                value: {},
            };
            if (isHighlightedValueType) {
                fieldForComponent.value.type = "highlighted-value";
                fieldForComponent.value.label = field.value || "--";
                fieldForComponent.value.color = field.highlightedStyle.colorName;
                fieldForComponent.value.status = !field.highlightedStyle.status ? field.highlightedStyle.colorName : field.highlightedStyle.status;
                fieldForComponent.value.variant = field.highlightedStyle.variantName;
                fieldForComponent.value.showIcon = true; // workaround for highlights being overwritten by other application records in sys_highlighted_value table
                fieldForComponent.value.icon = field.highlightedStyle.iconName;
            } else {
                fieldForComponent.value.type = "string";
                fieldForComponent.value.value = field.value || "--";
            }
            fieldLabelValueArray.push([fieldForComponent]);
        }
        const relatedItemRecord = {
            fieldLabelValueArray: fieldLabelValueArray,
            number: record.number,
            aria: record.aria,
            title: record.title,
            footer: record.footer,
            table: record.table,
            sysId: record.sysId,
            ciSysId: record.ciSysId,
            properties: record.properties,
            linkDestination: record.linkDestination,
            cardName: record.cardName
        };
        items.push(relatedItemRecord);
    });
    // set the sort and ascending/descending values for this category
    if (api.state.relatedItemCategorySysId) {
        const sortSelectData = api.state.allSelectComponentData[api.state.relatedItemCategorySysId];
        const sort = sortSelectData.length > 0 ? sortSelectData[0] : { sort: { id: "_" } };
        api.setState("relatedItemCategorySortData", sortSelectData);
        api.setState("selectedSortId", sort.id);
    }
    api.setState('relatedItemRecords', items);
    api.setState('showDetailView', true);
}
