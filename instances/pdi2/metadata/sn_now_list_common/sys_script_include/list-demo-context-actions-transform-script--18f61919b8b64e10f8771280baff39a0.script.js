(function transform(transformBuilder, transformScriptArgs) {
    try {
        if (!transformBuilder) return;
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

        var listModel = transformBuilder.transform();
        return listModel;
    } catch (error) {
        return {
            failed: true,
            error: error.message
        };
    }
})(transformBuilder, transformScriptArgs);
