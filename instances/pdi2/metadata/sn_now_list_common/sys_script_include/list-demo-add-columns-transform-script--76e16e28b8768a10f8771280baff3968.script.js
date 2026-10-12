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
            },
            {
                column: {
                    key: "url",
                    type: "url",
                    label: "Url",
                },
                columnData: [],
            },
            {
                index: 2,
                column: {
                    key: "highlightedvalue",
                    type: "string",
                    label: "Highlighted Value",
                },
                columnData: [],
            },
            {
                index: 1,
                column: {
                    key: "badge",
                    type: "custom",
                    label: "Badge",
                    componentTag: "now-badge",
                },
                columnData: [],
            },
            {
                column: {
                    key: "grouped",
                    label: "Grouped Col",
                    type: "grouped",
                    children: [{
                            key: "grouped_sub1",
                            label: "Grouped Child 1",
                            type: "string",
                            columnData: [],
                        },
                        {
                            key: "grouped_sub2",
                            label: "Grouped Child 2",
                            type: "string",
                            columnData: [],
                        },
                    ],
                },
                columnData: [],
            },
        ];
        transformBuilder.rowDefinitions.rows.forEach(function(row, index) {
            newColumns[0].columnData.push({
                rowKey: row.key,
                cellValue: {
                    value: emojiArr[Math.floor(Math.random() * emojiArr.length)],
                },
            });
            newColumns[1].columnData.push({
                rowKey: row.key,
                cellValue: {
                    value: "https://www.google.com",
                },
            });
            newColumns[2].columnData.push({
                rowKey: row.key,
                cellValue: {
                    highlightedValue: {
                        color: colorsArr[Math.floor(Math.random() * colorsArr.length)],
                        value: "abc123",
                    },
                },
            });
            newColumns[3].columnData.push({
                rowKey: row.key,
                cellValue: {
                    componentProps: {
                        color: colorsArr[Math.floor(Math.random() * colorsArr.length)],
                        value: Math.floor(Math.random() * 25),
                    },
                },
            });
            // TODO: add grouped column data once defect is fixed
            newColumns[4].column.children[0].columnData.push({
                rowKey: row.key,
                cellValue: {
                    value: Math.floor(Math.random() * 25),
                },
            });
            newColumns[4].column.children[1].columnData.push({
                rowKey: row.key,
                cellValue: {
                    value: Math.floor(Math.random() * 25),
                },
            });
        });

        var listModel = transformBuilder

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
            .addColumns(newColumns)

            // do not remove
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
