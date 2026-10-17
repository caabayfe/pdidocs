(function transform(transformBuilder, transformScriptArgs) {
    try {
        if (!transformBuilder) return;

        transformBuilder.rowDefinitions.customCellEmittedActions = ['NOW_BUTTON_ICONIC#CLICKED'];

        var columnData = transformBuilder.rowDefinitions.rows.map(function(row, index) {
            var item = transformScriptArgs ? transformScriptArgs.preset.find(function(presetItem) {
                return presetItem.id === row.key;
            }) : null;

            var label = item && item.isFavorite ? gs.getMessage('Remove from favorites') : gs.getMessage('Add to favorites');

            return {
                rowKey: row.key,
                cellValue: {
                    componentTag: 'now-button-iconic',
                    componentProps: {
                        icon: item && item.isFavorite ? 'star-fill' : 'star-outline',
                        variant: 'primary',
                        bare: true,
                        configAria: {
                            'aria-label': label
                        },
                        tooltipContent: label,
                    },
                    metadata: {
                        item: item
                    }
                },
            };
        });


        var newColumns = [{
            column: {
                columnFilterConfig: {
                    customTopText: ' ',
                    valueEditorCustomComponentTag: ''
                },
                key: 'favorite',
                label: '',
                type: 'custom',
                componentTag: 'now-button-iconic',
                width: '60px',
            },
            index: 0,
            columnData: columnData,
        }];

        transformBuilder.addColumns(newColumns);
        var listModel = transformBuilder.transform();

        return listModel;
    }

    // do not remove
    catch (error) {
        return {
            failed: true,
            error: error.message
        };
    }
})(transformBuilder, transformScriptArgs);
