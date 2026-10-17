(function transform(transformBuilder, transformScriptArgs) {
    try {
        if (!transformBuilder) return;

        // column header labels (field -> resolved + translated label) are
        // computed upstream in SetFieldLabels and bound in as transformScriptArgs (the
        // `field_labels` state, a flat { field: label } map), so no labels are hardcoded or
        // translated here. Labels for non-list fields (e.g. severity/category) are simply
        // ignored by editColumnLabels since those columns aren't in the list.
        const columnLabelMap = transformScriptArgs || {};
        const columnLabels = Object.keys(columnLabelMap).map(function (field) {
            return { columnKey: field, newLabel: columnLabelMap[field] };
        });

        const listModel = transformBuilder
            .editRowActions({
                add: [
                    {
                        id: 'show_info',
                        icon: 'info-circle-outline',
                        label: 'Show Error Information',
                        action: 'ERROR_FRAMEWORK#SHOW_ERROR_INFO',
                        index: 0
                    }
                ]
            })
            .editColumnLabels(columnLabels)
            .setColumnWidths([
                {
                    columnKey: EFConstants.ERROR_FIELDS.LAST_OCCURRENCE,
                    newWidth: '160px'
                },
                {
                    columnKey: EFConstants.ERROR_FIELDS.CONSECUTIVE_COUNT,
                    newWidth: '140px'
                },
                {
                    columnKey: EFConstants.ERROR_FIELDS.REFINED_ON,
                    newWidth: '160px'
                },
                {
                    columnKey: EFConstants.ERROR_FIELDS.ERROR_SOURCE,
                    newWidth: '320px'
                },
                {
                    columnKey: EFConstants.ERROR_FIELDS.STATE,
                    newWidth: '140px'
                },
                {
                    columnKey: EFConstants.ERROR_FIELDS.REOPENED_COUNT,
                    newWidth: '150px'
                }
            ])
            .transform();

        // POST-TRANSFORM: Format cell values
        listModel.rowDefinitions.rows.forEach(function(row) {
            if (row.cells && row.cells.state) {
                const stateValue = row.cells.state.value;
                const stateLabel = row.cells.state.label || stateValue;
                const colorVariant = EFConstants.STATE_COLOR_MAP[stateValue] || 'neutral';

                row.cells.state.highlightedValue = {
                    color: colorVariant,
                    value: stateLabel,
                    variant: 'tertiary',
                    size: 'sm'
                };
            }
        });

        return listModel;

    } catch (error) {
        return {
            failed: true,
            error: error.message
        };
    }
})(transformBuilder, transformScriptArgs);
