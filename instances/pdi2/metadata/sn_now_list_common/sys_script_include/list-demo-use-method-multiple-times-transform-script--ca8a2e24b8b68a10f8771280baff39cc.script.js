(function transform(transformBuilder, transformScriptArgs) {
    try {
        if (!transformBuilder) return;
        var emojiArr = [":)", ":(", ":D", ":|"];
        var colorsArr = [
            "critical",
            "high",
            "warning",
            "moderate",
            "positive",
            "info",
            "low",
            "magenta",
            "pink",
            "orange",
            "yellow",
            "brown",
            "green",
            "green-yellow",
            "blue",
            "gray",
            "teal",
            "purple",
        ];
        var newColumns = [{
            index: 5,
            column: {
                key: "emoji",
                type: "string",
                label: "Emoji",
            },
            columnData: [],
        }, ];
        transformBuilder.rowDefinitions.rows.forEach(function(row, index) {
            newColumns[0].columnData.push({
                rowKey: row.key,
                cellValue: {
                    value: emojiArr[Math.floor(Math.random() * emojiArr.length)],
                },
            });
        });
        transformBuilder.addColumns(newColumns);

        newColumns = [{
            column: {
                key: "url",
                type: "url",
                label: "Url",
            },
            columnData: [],
        }, ];
        transformBuilder.rowDefinitions.rows.forEach(function(row, index) {
            newColumns[0].columnData.push({
                rowKey: row.key,
                cellValue: {
                    value: "https://www.google.com",
                },
            });
        });
        transformBuilder.addColumns(newColumns);

        newColumns = [{
            index: 2,
            column: {
                key: "highlightedvalue",
                type: "string",
                label: "Highlighted Value",
            },
            columnData: [],
        }, ];
        transformBuilder.rowDefinitions.rows.forEach(function(row, index) {
            newColumns[0].columnData.push({
                rowKey: row.key,
                cellValue: {
                    highlightedValue: {
                        color: colorsArr[Math.floor(Math.random() * colorsArr.length)],
                        value: "abc123",
                    },
                },
            });
        });
        transformBuilder.addColumns(newColumns);

        newColumns = [{
            index: 1,
            column: {
                key: "badge",
                type: "custom",
                label: "Badge",
                componentTag: "now-badge",
            },
            columnData: [],
        }, ];
        transformBuilder.rowDefinitions.rows.forEach(function(row, index) {
            newColumns[0].columnData.push({
                rowKey: row.key,
                cellValue: {
                    componentProps: {
                        color: colorsArr[Math.floor(Math.random() * colorsArr.length)],
                        value: Math.floor(Math.random() * 25),
                    },
                },
            });
        });
        transformBuilder.addColumns(newColumns);
        var listModel = transformBuilder

            /* INSTRUCTIONS */
            // The below commented out calls are customizations that can be applied to the list.
            // Uncomment any customizations that you would like to use, and provide your own arguments.
            // We recommend that if possible, you adminain the order the functions are written in, and only use each function once. This prevents accidentally overwriting a customization.
            // Please note note that any operations involving removal or disabling will be executed before operations involving addition or enabling.
            // Keep in mind that any customizations are only for rendering and will not be persisted in any capacity.
            // This script will run on every data fetch, including initial fetch, filtering, sorting, grouping, etc.
            // This API is defined in sys_script_include_a816a0930535a510f8777eba8d465d65, see that file for source code and documentation.

            /* DATA MUTATORS */

            /**
             * Adds new columns and their corresponding body data at a provided index.
             *
             * @param {Object[]} newColumns Array representing all the columns to be added, index and their respective column data
             * @param {Object} newColumns[].column An object containing the definiton of a single column. Full column docs  - <public url>/now-list/typeSchemas/columnDefinitions/columnsDocs.md
             * @param {number} newColumns[].index The 0-based index at which the column needs to be added. If empty or falsy, the columns is added at the end of the table.
             * @param {Object[]} newColumns[].columnData Array representing all of the columns' cell data to be added and their respective row keys
             * @param {string} newColumns[].columnData.rowKey The key of a row to update
             * @param {Object} newColumns[].columnData.cellValue An object containing the data for a single cell. Full cells docs  - <public url>/now-list/typeSchemas/rowDefinitions/cellsDocs.md
             * TODO: add public urls for docs for columnsDocs and cellDocs
             */
            //.addColumns(newColumns)

            /* COLUMN HEADER MUTATORS */

            /**
             * Changes the label (text) for one or many column header cells
             *
             * @param {Object[]} newLabels Array representing all the columns to be edited and their respective new labels
             * @param {string} newLabels[].columnKey The key of a column to update
             * @param {string} newLabels[].newLabel The new label to display
             */
            .editColumnLabels([{
                    columnKey: "priority",
                    newLabel: "Rank",
                },
                {
                    columnKey: "number",
                    newLabel: "Identifier",
                },
            ])
            .editColumnLabels([{
                    columnKey: "priority",
                    newLabel: "ABC",
                },
                {
                    columnKey: "number",
                    newLabel: "123",
                },
            ])
            .editColumnLabels([{
                    columnKey: "state",
                    newLabel: "Status",
                },
                {
                    columnKey: "opened_at",
                    newLabel: "Created",
                },
            ])

            .transform();

        return listModel;
    } catch (error) {
        // do not remove
        return {
            failed: true,
            error: error.message,
        };
    }
})(transformBuilder, transformScriptArgs);
