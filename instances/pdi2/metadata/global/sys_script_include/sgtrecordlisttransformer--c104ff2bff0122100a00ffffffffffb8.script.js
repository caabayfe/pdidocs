(function transform(transformBuilder, transformScriptArgs) {
    try {
        if (!transformBuilder) return;

        var newCols = [];

        if (transformScriptArgs && transformScriptArgs.removeLinkFromLastScriptedColumn)
            _removeLinkFromLastScriptedColumn();

        if (transformScriptArgs && transformScriptArgs.addActionColumn)
            newCols.push(_getActionColumn());

        if (transformScriptArgs && transformScriptArgs.addLastScriptedColumn)
            newCols.push(_getLastScriptedColumn());

        if (newCols.length > 0)
            transformBuilder.addColumns(newCols);

        var newLabels = [];
        if (transformScriptArgs && transformScriptArgs.editRemovalScanNumberColumnLabel)
            newLabels.push(_getRemovalScanNumberColumnLabel());

        transformBuilder.editColumnLabels(newLabels);

        return transformBuilder.transform();
    }

    // do not remove
    catch (error) {
        return {
            failed: true,
            error: error.message
        };
    }

    function _removeLinkFromLastScriptedColumn() {
        transformBuilder.columnDefinitions.columns.forEach(colDef => {
            if (colDef.key == 'ssr_last_scripted') {
                colDef.renderAsLink = false;
            }
        });
    }

    function _getLastScriptedColumn() {
        var columnData = [];
        transformBuilder.rowDefinitions.rows.forEach(row => {
            columnData.push({
                rowKey: row.key,
                cellValue: {
                    value: gs.getMessage('None')
                }
            });
        });
        return {
            index: 1,
            column: {
                key: "lastScripted",
                label: "Last scripted",
            },
            columnData: columnData
        };
    }

    function _getActionColumn() {
        var col = {
            column: {
                key: "action",
                label: "Action",
                renderAsLink: true
            },
            columnData: []
        };
        transformBuilder.rowDefinitions.rows.forEach(row => {
            col.columnData.push({
                rowKey: row.key,
                cellValue: {
                    value: ["in_progress", "scheduled"].indexOf(row.cells["status"].value) == -1 ? '-' : gs.getMessage("Cancel scheduled job")
                }
            });
        });
        return col;
    }

    function _getRemovalScanNumberColumnLabel() {
        return {
            columnKey: "removal_scan_number",
            newLabel: gs.getMessage("Removal job number")
        };
    }
})(transformBuilder, transformScriptArgs);
