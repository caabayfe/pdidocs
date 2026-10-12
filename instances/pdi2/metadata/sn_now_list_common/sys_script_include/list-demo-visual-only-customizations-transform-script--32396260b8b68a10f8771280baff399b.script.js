(function transform(transformBuilder, transformScriptArgs) {
    try {
        if (!transformBuilder) return;
        var listModel = transformBuilder

            /* COLUMN HEADER MUTATORS */

            /**
             * Changes the label (text) for one or many column header cells
             *
             * @param {Object[]} newLabels Array representing all the columns to be edited and their respective new labels
             * @param {string} newLabels[].columnKey The key of a column to update
             * @param {string} newLabels[].newLabel The new label to display
             */
            .editColumnLabels([{
                    columnKey: "short_description",
                    newLabel: "Super special short description",
                },
                {
                    columnKey: "number",
                    newLabel: "Super special number",
                },
            ])

            /**
             * Sets the column header text click action text for one, many, or all columns.
             *
             * @param {string} text The new text to display in a tooltip on every column that conveys what action clicking triggers. If empty or falsy, all columns will be disabled and will not have a tooltip.
             */
            .setColumnHeaderClickActionText("Edited tooltip")

            /**
             * Updates the column header icons based on the provided edit type.
             *
             * Added icons are purely decorative and not clickable.
             * @param {Object} editIconsObj Object containing 'add' and 'remove' properties.
             * @param {Object[]} editIconsObj.add Array representing all the columns to be edited and their respective inputs for adding icons.
             *   - @param {string} editIconsObj.add[].columnKey The key of a column where column header icons should be added.
             *       If null, icons will be added to every column.
             *   - @param {'start'|'end'} editIconsObj.add[].position The position to add these icons, relative to the text label.
             *       Either 'start' or 'end'.
             *   - @param {Object[]} editIconsObj.add[].iconArr Array of objects representing the icons to be added, from start to end.
             *   - @param {string} editIconsObj.add[].iconArr[].value Name of the icon to render from the icon library.
             *   - @param {string} editIconsObj.add[].iconArr[].color Color variant for the icon, e.g., 'warning' or 'moderate'.
             *   - @param {string} editIconsObj.add[].iconArr[].label Aria-label to be used for accessibility.
             * @param {Object[]} editIconsObj.remove Array representing all the icons to be removed and from which columns.
             *   - @param {string} editIconsObj.remove[].columnKey The key of a column where column header icons should be removed.
             *       If null, icons will be removed from the given position across the table. If position is also null, icons for both positions will be removed.
             *   - @param {'start'|'end'} editIconsObj.remove[].position The existing position of the icon(s) to be removed, relative to the text label.
             *       Either 'start' or 'end'. If null, icons for the given column will be removed from both positions.
             *   - @param {number[]} editIconsObj.remove[].iconIndexArr Array of 0-based indices of objects representing the icons to be removed.
             *       If null, all icons will be removed from the given position. If position is also null, all icons for both positions will be removed.
             */
            .editColumnHeaderIcons({
                add: [{
                        columnKey: "short_description",
                        position: "start",
                        iconArr: [{
                                value: "lightning-outline",
                                color: "warning",
                                label: "The name of this column has been changed",
                            },
                            {
                                value: "lightning-outline",
                                color: "warning",
                                label: "The name of this column has been changed",
                            },
                            {
                                value: "lightning-outline",
                                color: "warning",
                                label: "The name of this column has been changed",
                            },
                        ],
                    },
                    {
                        columnKey: "assigned_to",
                        position: "end",
                        iconArr: [{
                                value: "user-outline",
                                label: "User column",
                            },
                            {
                                value: "folder-open-outline",
                                color: "moderate",
                                label: "caller",
                            },
                        ],
                    },
                    {
                        columnKey: "assigned_to",
                        position: "start",
                        iconArr: [{
                                value: "user-outline",
                                label: "User column",
                            },
                            {
                                value: "folder-open-outline",
                                color: "moderate",
                                label: "caller",
                            },
                        ],
                    },
                ],
            })

            /**
             * Sets the display type for a person column: either avatar, name, or both. This function is not applicable to columns that are not the person type.
             *
             * @param {Object[]} newDisplays An array representing the columns to update and their new display setting.
             * @param {string} newDisplays[].columnKey The key of a column to update.
             * @param {'avatar'|'name'|'both'} newDisplays[].newDisplay Sets the appearance of body cells in this column. Can be 'avatar', 'name', or 'both'.
             */
            .changeDisplayForPersonColumn([{
                columnKey: "assigned_to",
                newDisplay: "avatar"
            }, ])

            // do not remove
            .transform();

        // highlight content
        listModel.rowDefinitions.highlightedContent = ["Java", "VLAN"];

        // display state as an icon
        listModel.columnDefinitions.columns[3].type = "icon";

        var iconMap = {
            New: {
                value: "star-outline",
                color: "info",
            },
            "In Progress": {
                value: "action-outline",
                color: "positive",
            },
            "On Hold": {
                value: "workflow-on-hold-outline",
                color: "warning",
            },
            Resolved: {
                value: "emoji-positive-outline",
                color: "positive",
            },
            Closed: {
                value: "square-close-outline",
                color: "moderate",
            },
            Canceled: {
                value: "circle-close-outline",
                color: "high",
            },
        };

        listModel.rowDefinitions.rows.forEach(function(row) {
            var currentValue = row.cells.state.value;
            var newValue = iconMap[currentValue];
            row.cells.state = newValue;
        });

        return listModel;
    } catch (error) {
        // do not remove
        return {
            failed: true,
            error: error.message,
        };
    }
})(transformBuilder, transformScriptArgs);
