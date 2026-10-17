(function transform(transformBuilder, transformScriptArgs) {
    try {
        if (!transformBuilder) return;
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
        var newCols = [{
                index: 2,
                column: {
                    key: "highlightedvalue",
                    type: "string",
                    label: "Highlighted",
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
            }
        ];
        const setColsValues = row => {
            newCols[0].columnData.push({
                rowKey: row.key,
                cellValue: {
                    highlightedValue: {
                        color: colorsArr[Math.floor(Math.random() * colorsArr.length)],
                        value: "abc123",
                    },
                },
            });
            newCols[1].columnData.push({
                rowKey: row.key,
                cellValue: {
                    componentProps: {
                        color: colorsArr[Math.floor(Math.random() * colorsArr.length)],
                        value: Math.floor(Math.random() * 25),
                    },
                },
            });
        };
        transformBuilder.rowDefinitions.rows.forEach(row => {
            row.children?.forEach(child => setColsValues(child)); // when the list is grouped by a column
            row.cells && setColsValues(row);
        });
        transformBuilder.addColumns(newCols);

        /* COLUMN HEADER MUTATORS */

        /**
         * Changes the label (text) for one or many column header cells
         *
         * @param {Object[]} newLabels Array representing all the columns to be edited and their respective new labels
         * @param {string} newLabels[].columnKey The key of a column to update
         * @param {string} newLabels[].newLabel The new label to display
         */
        transformBuilder.editColumnLabels([{
                columnKey: "short_description",
                newLabel: "Special description",
            },
            {
                columnKey: "number",
                newLabel: "Special number",
            },
        ]);

        /**
         * Toggles the enablement of the column header label click based on the provided edit type for one, many, or all columns.
         * This function can be used to undo the default behavior of sorting a column on header text click.
         * It can also be used to add clickability to a custom added column, for example for a custom sort.
         *
         * @param {Object} editColumnsObj Object containing 'enable' and 'disable' properties.
         * @param {string[]} editColumnsObj.enable Array of column keys for which to enable column header click.
         * @param {string[]} editColumnsObj.disable Array of column keys for which to disable column header click.
         */
        transformBuilder.toggleColumnHeaderClickEnablement({
            disable: ["short_description"]
        });

        /**
         * Sets the column header text click action text for one, many, or all columns.
         *
         * @param {string} text The new text to display in a tooltip on every column that conveys what action clicking triggers. If empty or falsy, all columns will be disabled and will not have a tooltip.
         */
        transformBuilder.setColumnHeaderClickActionText("Edited tooltip");

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
        transformBuilder.editColumnHeaderIcons({
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
        });

        /**
         * Toggles the ability to click on the text in a given column of type URL, link, or person.
         * If you want to toggle this for all columns across the list, we recommend using the boolean property on the controller.
         *
         * @param {Object} editColumnObj Object containing 'enable' and 'disable' properties.
         * @param {string[]} editColumnObj.enable An array of column keys where clickable text should be enabled.
         *   If empty or falsy, clickable text will be enabled in all columns.
         * @param {string[]} editColumnObj.disable An array of column keys where clickable text should be disabled.
         *   If empty or falsy, clickable text will be disabled in all columns.
         */
        transformBuilder.toggleColumnEnablement({
            disable: ["sys_class_name"]
        });

        /**
         * Toggles the ability to click on the text in a given cell of type URL, link, or person.
         * The value of disabled at the cell level overrides the value of disabled at the column level.
         *
         * @param {Object} editCellsObj Object containing 'enable' and 'disable' properties.
         * @param {Object[]} editCellsObj.enable Array of objects representing cells where clickable text should be enabled.
         *   - @param {string} editCellsObj.enable[].rowKey The key of the row containing the cell.
         *   - @param {string} editCellsObj.enable[].cellKey The key of the cell.
         * @param {Object[]} editCellsObj.disable Array of objects representing cells where clickable text should be disabled.
         *   - @param {string} editCellsObj.disable[].rowKey The key of the row containing the cell.
         *   - @param {string} editCellsObj.disable[].cellKey The key of the cell.
         */
        transformBuilder.toggleCellsEnablement({
            disable: [{
                    rowKey: "46e9b4afa9fe198101026e122b85f442",
                    cellKey: "number"
                },
                {
                    rowKey: "46e9b4afa9fe198101026e122b85f442",
                    cellKey: "assigned_to"
                }
            ]
        });

        /**
         * Changes the column width for one or many columns
         * This new width will remain in effect until the user manually resizes any column. If the user resizes a column, the manually adjusted width will take precedence.
         * Users can be prevented from resizing a column by setting `columnResizingEnabled` to false. Full doc: <public url>/now-list#public-props
         *
         * @param {Object[] | string} newWidths Either an array representing all the columns to be edited and their respective new widths, or a string representing the width in px to be set for every column, eg '40px'.
         * @param {string} newLabels[].columnKey The key of a column to update
         * @param {string} newLabels[].newWidth The new width in px
         */
        transformBuilder.setColumnWidths([{
            columnKey: "assigned_to",
            newWidth: "200px"
        }]);

        /**
         * Changes the maximum number of characters allowed to be displayed per cell before truncation for one or many columns
         *
         * @param {Object[]} newMaxChars Either an array representing all the columns to be edited and their respective new maximum.
         * @param {string} newMaxChars[].columnKey The key of a column to update
         * @param {string} newMaxChars[].newMaxChars The new maximum characters in the column
         */
        transformBuilder.setColumnMaxCharacters([{
            columnKey: "short_description",
            newMaxChars: 40
        }, ]);

        /**
         * Sets highlighted values for cells
         *
         * @param {Object[]} newHighlightedValues An array representing the highlighted values and the cell they should appear in.
         * @param {string} newHighlightedValues[].rowKey The key of a row containing the cell
         * @param {string} newHighlightedValues[].cellKey The key of a cell to set highlighted value
         * @param {Object} newHighlightedValues[].highlightedValueObj The object containing the highlighted value. Full highlighted value doc - <public url>/now-list/typeSchemas/rowDefinitions/cellsDocs.md#highlighted-value
         * TODO: add public urls for docs for cellDocs
         */
        var newHighlightedValues = [{
            rowKey: '46e9b4afa9fe198101026e122b85f442',
            cellKey: 'priority',
            highlightedValueObj: {
                color: 'pink',
                value: '0 - Pink',
                variant: 'primary',
                iconName: 'bookmark-outline',
                showIcon: true
            }
        }];
        transformBuilder.setHighlightedValues(newHighlightedValues);

        /**
         * Sets the display type for a person column: either avatar, name, or both. This function is not applicable to columns that are not the person type.
         *
         * @param {Object[]} newDisplays An array representing the columns to update and their new display setting.
         * @param {string} newDisplays[].columnKey The key of a column to update.
         * @param {'avatar'|'name'|'both'} newDisplays[].newDisplay Sets the appearance of body cells in this column. Can be 'avatar', 'name', or 'both'.
         */
        const setAssignedToImageSrc = ({ cells }) => {
            const { assigned_to } = cells || {};
            if (assigned_to?.metadata?.referenceSysId) {
                const { metadata: { referenceSysId } } = assigned_to;
                const imageSrc = GlideAvatarFinder.getAvatarPath(referenceSysId);
                cells.assigned_to.imageSrc = imageSrc;
            }
        };
        transformBuilder.rowDefinitions.rows.forEach(row => {
            row.children?.forEach(child => setAssignedToImageSrc(child)); // when the list is grouped by a column
            row.cells && setAssignedToImageSrc(row);
        });
        var assignedToDisplays = [{
            columnKey: 'assigned_to',
            newDisplay: 'both'
        }];
        transformBuilder.changeDisplayForPersonColumn(assignedToDisplays);

        /**
         * Sets the numActionIcons property to determine the number of actions to render as icons.
         * The first n items in the actionItems array will be rendered as icon buttons, and the rest will be hidden under a dropdown.
         *
         * @param {number} numActionIcons Number of actions to render as icons
         */
        var numActionIcons = 2;
        transformBuilder.setRowActionCountOverflow(numActionIcons);

        /**
         * Updates the row actions for all rows based on the provided edit type.
         *
         * @param {Object} editActionsObj Object containing 'add' and 'remove' properties.
         * @param {Object[]} editActionsObj.add Array of objects representing the row actions to be added.
         *   - @param {string} editActionsObj.add[].id A unique string identifier for this action
         *   - @param {string} editActionsObj.add[].icon A now-icon name to represent this action
         *   - @param {string} editActionsObj.add[].label The label to be displayed in tooltips and dropdowns
         *   - @param {string} editActionsObj.add[].action The name of a Seismic action to dispatch
         *   - @param {number} editActionsObj.add[].index The index at which to insert the action. If null or falsy, the action will be added to the end of the array.
         * @param {string[]} editActionsObj.remove An array of ID strings representing all the row actions to be removed.
         *   If empty or falsy, all the row actions will be removed
         */
        var addRowActions = {
            add: [{
                    id: 'quick-print',
                    icon: 'printer-outline',
                    label: 'Print Record',
                    action: 'QUICK_PRINT_RECORD_REQUESTED'
                },
                {
                    id: 'quick-delete',
                    icon: 'circle-minus-outline',
                    label: 'Delete Record',
                    action: 'QUICK_DELETE_RECORD_REQUESTED'
                },
                {
                    id: 'quick-send',
                    icon: 'send-outline',
                    label: 'Send Record',
                    action: 'QUICK_SEND_RECORD_REQUESTED'
                },
                {
                    id: 'quick-bookmark',
                    icon: 'bookmark-outline',
                    label: 'Bookmark Record',
                    action: 'QUICK_BOOKMARK_RECORD_REQUESTED'
                },
                {
                    id: 'quick-tags',
                    icon: 'tags-outline',
                    label: 'Tags',
                    action: 'QUICK_TAGS_RECORD_REQUESTED'
                }
            ]
        };
        transformBuilder.editRowActions(addRowActions);

        /**
         * Toggles enablement/disablement one or many row actions on a row by row basis. Any disabled actions will be visible but not interactable.
         *
         * @param {Object} editActionsObj An array of objects representing the row actions to be toggled.
         * @param {Object[]} editActionsObj[].disable An array of objects representing the row actions to be disabled. The specified action will be visible but not interactable.
         *   - @param {string} editActionsObj[].disable.rowKey The key of the row to update
         *   - @param {string[]} editActionsObj[].disable.actionIds An array of action keys that represent actions to disable.
         */
        var rowActionsToggles = {
            disable: [{
                rowKey: '46e9b4afa9fe198101026e122b85f442',
                actionIds: ['quick-tags', 'quick-bookmark', 'quick-send', 'quick-edit', 'quick-delete']
            }]
        };
        transformBuilder.toggleRowActionsEnablement(rowActionsToggles);

        /**
         * Updates the column header actions based on the provided edit type.
         * If all actions are removed through this function, the default column filtering popover will display on the list.
         *
         * @param {Object} editColumnActionsObj Object containing 'add' and 'remove' properties.
         * @param {Object[]} editColumnActionsObj.add Array of objects representing the column and its respective column header actions to be added.
         *   - @param {string} editColumnActionsObj.add[].columnKey The key of the column to update
         *   - @param {Object[]} editColumnActionsObj.add[].actionObjArr The action object to be added
         *     - @param {string} editColumnActionsObj.add[].actionObjArr[].id The id of the action to be added
         *     - @param {string} editColumnActionsObj.add[].actionObjArr[].label The label of the action to be added
         *     - @param {string} editColumnActionsObj.add[].actionObjArr[].action The name of a Seismic action to dispatch on click
         *     - @param {number} editColumnActionsObj.add[].actionObjArr[].index The index at which to insert the action. If null or falsy, the action will be added to the end of the array.
         * @param {Object[]} editColumnActionsObj.remove Array of objects representing the column and its respective column header actions to be removed.
         *   - @param {string} editColumnActionsObj.remove[].columnKey The key of the column to update
         *   - @param {string[]} editColumnActionsObj.remove[].actionIdArr The IDs of actions to be removed
         */
        var addColHeaderActions = {
            add: [{
                    columnKey: 'short_description',
                    actionObjArr: [{
                        id: 'short_description_translate',
                        label: 'Translate...',
                        action: 'LIST_CTRL#SHORT_DESCRIPTION_TRANSLATE'
                    }]
                },
                {
                    columnKey: 'number',
                    actionObjArr: [{
                        id: 'number_show_highlight',
                        label: 'Show Highlight',
                        action: 'LIST_CTRL#NUMBER_SHOW_HIGHLIGHT'
                    }]
                }
            ]
        };
        transformBuilder.editColumnHeaderActions(addColHeaderActions);

        /**
         * Updates the cell actions across a whole column based on the provided edit type.
         * This can be used to remove the default 'Show matching' and 'Filter out' actions, but we recommend using the controller prop if you want to remove both.
         *
         * @param {Object} editActionsObj Object containing 'add' and 'remove' properties.
         * @param {Object[]} editActionsObj.add Array of objects representing the column and its respective cell actions to be added.
         *   - @param {string} editActionsObj.add[].columnKey The key of the column to update
         *   - @param {Object[]} editActionsObj.add[].actionObjArr The action object to be added
         *     - @param {string} editActionsObj.add[].actionObjArr[].id The id of the action to be added
         *     - @param {string} editActionsObj.add[].actionObjArr[].label The label of the action to be added
         *     - @param {string} editActionsObj.add[].actionObjArr[].action The name of a Seismic action to dispatch on click
         *     - @param {number} editActionsObj.add[].actionObjArr[].index The index at which to insert the action. If null or falsy, the action will be added to the end of the array.
         * @param {Object[]} editActionsObj.remove Array of objects representing the column and its respective cell actions to be removed.
         *   - @param {string} editActionsObj.remove[].columnKey The key of the column to update. If empty or falsy, removes all cell actions across the list.
         *   - @param {string[]} editActionsObj.remove[].actionIdArr The IDs of actions to be removed. If empty or falsy, removes all the cell actions on the column.
         */
        var addColCellActions = {
            add: [{
                columnKey: 'assigned_to',
                actionObjArr: [{
                        id: 'assigned_to_copy_full_name',
                        label: 'Copy Full Name',
                        action: 'LIST_CTRL#ASSIGNED_TO_COPY_FULL_NAME'
                    },
                    {
                        id: 'assigned_to_copy_username',
                        label: 'Copy Username',
                        action: 'LIST_CTRL#ASSIGNED_TO_COPY_USERNAME'
                    },
                    {
                        id: 'assigned_to_copy_sys_id',
                        label: 'Copy Sys ID',
                        action: 'LIST_CTRL#ASSIGNED_TO_COPY_SYS_ID'
                    }
                ]
            }]
        };
        transformBuilder.editCellActionsForColumn(addColCellActions);

        /**
         * Updates the override cell actions based on the provided edit type.
         * If there are no actions present in this override, the cell actions defined at the column level will be used instead.
         *
         * @param {Object} editActionsObj Object containing 'add' and 'remove' properties.
         * @param {Object[]} editActionsObj.add Array of objects representing the cell and its respective cell actions to be added.
         *   - @param {string} editActionsObj.add[].rowKey The key of the row to update
         *   - @param {string} editActionsObj.add[].cellKey The key of the cell to update
         *   - @param {Object[]} editActionsObj.add[].actionObjArr The action object to be added
         *     - @param {string} editActionsObj.add[].actionObjArr[].id The id of the action to be added
         *     - @param {string} editActionsObj.add[].actionObjArr[].label The label of the action to be added
         *     - @param {string} editActionsObj.add[].actionObjArr[].action The seismic action to dispatch from the new action
         *     - @param {number} editActionsObj.add[].actionObjArr[].index The index at which to insert the action. If null or falsy, the action will be added to the end of the array.
         * @param {Object[]} editActionsObj.remove Array of objects representing the cell and its respective cell actions to be removed.
         *   - @param {string} editActionsObj.remove[].rowKey The key of the row to update
         *   - @param {string} editActionsObj.remove[].cellKey The key of the cell to update
         *   - @param {string[]} editActionsObj.remove[].actionIdArr The action ids to be removed
         */
        var assignedToDefault = {
            cellKey: 'assigned_to',
            actionObjArr: [{
                    id: 'show_matching',
                    label: 'Show Matching',
                    action: 'LIST_CTRL#SHOW_MATCHING_CLICKED'
                },
                {
                    id: 'filter_out',
                    label: 'Filter Out',
                    action: 'LIST_CTRL#FILTER_OUT_CLICKED'
                }
            ]
        };
        var assignedToMe = {
            cellKey: 'assigned_to',
            actionObjArr: [{
                id: 'assigned_to_assign_to_me',
                label: 'Assign To Me',
                action: 'LIST_CTRL#ASSIGNED_TO_ASSIGN_TO_ME'
            }]
        };
        var add = transformBuilder.rowDefinitions.rows.map(r => r.children ?? r)
            .flat()
            .filter(({ cells }) => cells.assigned_to.value === '')
            .map(({ key: rowKey, cells }) => ({
                rowKey,
                ...(cells.state.value.indexOf('Closed') < 0 ? assignedToMe : assignedToDefault)
            }));
        var assignedToCopy = {
            cellKey: 'assigned_to',
            actionIdArr: ['assigned_to_copy_full_name', 'assigned_to_copy_username', 'assigned_to_copy_sys_id']
        };
        var remove = transformBuilder.rowDefinitions.rows.map(r => r.children ?? r)
            .flat()
            .filter(({ cells }) => cells.assigned_to.value === '')
            .map(({ key: rowKey }) => ({ rowKey, ...assignedToCopy }));
        var overrideCellActions = { add, remove };
        transformBuilder.editOverrideCellActions(overrideCellActions);

        /**
         * Sets the expanded state of one or more groups
         *
         * @param {Object[]} groupObjectArr An array of objects representing the group and its respective expanded state
         * @param {string} groupObjectArr[].groupKey The key of the group to update
         * @param {boolean} groupObjectArr[].isExpanded The expanded state of the group
         */
        var groupExpandedStates = [{
                groupKey: 'taskPriority1',
                isExpanded: false
            },
            {
                groupKey: 'taskPriority2',
                isExpanded: false
            },
            {
                groupKey: 'taskPriority3',
                isExpanded: false
            },
            {
                groupKey: 'taskPriority4',
                isExpanded: true
            },
            {
                groupKey: 'taskPriority5',
                isExpanded: false
            }
        ];
        transformBuilder.setGroupsExpandedState(groupExpandedStates);

        /**
         * Updates the group actions based on the provided edit type.
         *
         * @param {Object} editActionsObj Object containing 'add' and 'remove' properties.
         * @param {Object[]} editActionsObj.add Array of objects representing the group and its respective actions to be added.
         *   - @param {string} editActionsObj.add[].groupKey The key of the group to update
         *   - @param {Object[]} editActionsObj.add[].actionObjArr The action object to be added
         *     - @param {string} editActionsObj.add[].actionObjArr[].id The id of the action to be added
         *     - @param {string} editActionsObj.add[].actionObjArr[].label The label of the action to be added
         *     - @param {string} editActionsObj.add[].actionObjArr[].action The name of a Seismic action to dispatch on click
         *     - @param {number} editActionsObj.add[].actionObjArr[].index The index at which to insert the action. If null or falsy, the action will be added to the end of the array.
         * @param {Object[]} editActionsObj.remove Array of objects representing the group and its respective actions to be removed.
         *   - @param {string} editActionsObj.remove[].groupKey The key of the group to update. If null or falsy, the actions will be removed from all groups.
         *   - @param {string[]} editActionsObj.remove[].actionIdArr The IDs of actions to be removed. If null or falsy, all the actions will be removed from the given group.
         */
        var editGroupActionsObj = {
            add: [{
                groupKey: 'taskPriority1',
                actionObjArr: [{
                    id: 'hide_all',
                    label: 'Hide All',
                    action: 'GROUP_HIDE_ALL',
                    index: 0
                }]
            }],
            remove: [{
                groupKey: 'taskPriority1',
                actionObjArr: [{
                    id: 'show_all',
                    label: 'Show All',
                    action: 'GROUP_SHOW_ALL',
                    index: 0
                }]
            }]
        };
        transformBuilder.editGroupActions(editGroupActionsObj);

        /**
         * Hides declarative actions that require record selection
         */
        transformBuilder.hideDAsRequiringSelection();
        var listModel = transformBuilder.transform();
        return listModel;
    } catch (error) {
        return {
            failed: true,
            error: error.message,
        };
    }
})(transformBuilder, transformScriptArgs);
