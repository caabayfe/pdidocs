(function transform(transformBuilder, transformScriptArgs) {
    try {
        if (!transformBuilder) return;
		// Get the list of hosted MID names from transformScriptArgs
        var hostedMidNames = (transformScriptArgs && transformScriptArgs.hostedMidNames) || [];
        
        var listModel = transformBuilder;
		
		// Prepare column data for the new Type column
        var typeColumnData = [];
        listModel.rowDefinitions.rows.forEach(function(row) {
            var midName = row.cells["name"] ? row.cells["name"].value : "";
            var isHosted = hostedMidNames.indexOf(midName) !== -1;
            var typeValue = isHosted ? "Hosted MID" : "On-prem MID";
            
            typeColumnData.push({
                rowKey: row.key,
                cellValue: {
                    value: typeValue,
                    displayValue: typeValue
                }
            });
        });

        // Only add Type column if there are hosted MID names
        if (hostedMidNames.length > 0) {
            listModel = transformBuilder
                .addColumns([{
                    column: {
                        key: 'type',
                        label: 'Type',
                        type: 'string'
                    },
                    index: 2, // Add as second column (0-based index)
                    columnData: typeColumnData
                }])
                .transform();
        }

        listModel.columnDefinitions.columns.forEach(function(column) {
            // add end icon to short description colum
            if (column.key === 'unresolved_issues') {
                column.type = "custom";
                column.componentTag = "now-highlighted-value";
                column.defaultComponentProps = {
                    size: "md",
                    color: "none"
                };
            }
        });


        listModel.rowDefinitions.rows.forEach(function(row) {
            var unresolvedCell = row.cells["unresolved_issues"];
            var value = unresolvedCell.value;

            unresolvedCell.componentProps = {
                label: value == 0 ? "-" : value
            };

            ["validated", "status"].forEach(function(key) {
                var cell = row.cells[key];
                if (cell && cell.highlightedValue) {
                    cell.highlightedValue.size = "sm";
                }
            });
        });

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
