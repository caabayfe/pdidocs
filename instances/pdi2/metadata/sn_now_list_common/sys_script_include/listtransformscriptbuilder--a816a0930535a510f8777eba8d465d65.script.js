var ListTransformScriptBuilder = Class.create();
ListTransformScriptBuilder.prototype = (function() {

    var _rowDefinitions, _columnDefinitions, _overlayDefinition, _declarativeActions, _hideDAsRequiringSelection, _columnDefinitionMutations, _rowActionsMutations, _featureFlags, _tableName, _shouldAggregatesRowBeSticky;
    var rowOperations = [];
    var columnOperations = [];
    var columnAdditions = [];
    const EditType = {
        ADD: 'add',
        REMOVE: 'remove',
        ENABLE: 'enable',
        DISABLE: 'disable'
    };

    function initialize(declarativeActions) {
        _hideDAsRequiringSelection = false;
        _rowDefinitions = { rows: [] };
        _columnDefinitions = { columns: [] };
        _overlayDefinition = {};
        _declarativeActions = declarativeActions || [];
        _columnDefinitionMutations = {};
        _rowActionsMutations = {};
        _featureFlags = {};
        _tableName = '';
        _shouldAggregatesRowBeSticky = true;
    }

    function getRowDefinitions() {
        return _rowDefinitions;
    }

    function setRowDefinitions(rowDefs) {
        _rowDefinitions = rowDefs;
        return this;
    }

    function getColumnDefinitions() {
        return _columnDefinitions;
    }

    function setColumnDefinitions(colDefs) {
        _columnDefinitions = colDefs;
        return this;
    }

        function getOverlayDefinition() {
        return _overlayDefinition;
    }

    function setOverlayDefinition(overlayDef) {
        _overlayDefinition = overlayDef;
        return this;
    }

    function setFeatureFlags(flags) {
        _featureFlags = flags;
        return this;
    }

    function getTableName() {
        return _tableName;
    }
    
    function setTableName(tableName) {
        _tableName = tableName;
        return this;
    }

    function disableCalculationsRowStickyBehavior() {
        _shouldAggregatesRowBeSticky = false;
        return this;
    }

    /* DATA MUTATORS */

    /**
     * Adds new columns and their corresponding body data at a provided index.
     * 
     * @param {Object[]} newColumns Array representing all the columns to be added, index and their respective column data
     * @param {Object} newColumns[].column An object containing the definiton of a single column. Full column docs  - &lt;public url&gt;/now-list/typeSchemas/columnDefinitions/columnsDocs.md
     * @param {number} newColumns[].index The 0-based index at which the column needs to be added. If empty or falsy, the columns is added at the end of the table.
     * @param {Object[]} newColumns[].columnData Array representing all of the columns' cell data to be added and their respective row keys
     * @param {string} newColumns[].columnData.rowKey The key of a row to update
     * @param {Object} newColumns[].columnData.cellValue An object containing the data for a single cell. Full cells docs  - &lt;public url&gt;/now-list/typeSchemas/rowDefinitions/cellsDocs.md
     * TODO: add public urls for docs for columnsDocs and cellDocs
     */
    function addColumns(newColumns) {
        columnAdditions = newColumns;
        return this;
    }

    /**
     * Adds/replaces a value to a cell
     * This replaces the cells' value in the row object of rowDefinition
     * Don't expose, since the new added values create issues with column sorting and other features
     * 
     * @param {string} columnKey The key of a column to update
     * @param {string} rowKey The key of a row to update
     * @param {Object} cellValue An object containing the data for a single cell. Full cells docs  - &lt;public url&gt;/now-list/typeSchemas/rowDefinitions/cellsDocs.md
     * TODO: add public urls for docs for cellDocs
     */
    function addCellValues(columnKey,rowKey,cellValue) {
        rowOperations.push(function(row) {
            if (!rowKey) return;
            if (rowKey == row.key) {
                row.cells[columnKey] = cellValue;
            }
        });
        return this;
    }

    /* COLUMN HEADER MUTATORS */
    
    /**
     * Changes the label (text) for one or many column header cells
     * 
     * @param {Object[]} newLabels Array representing all the columns to be edited and their respective new labels
     * @param {string} newLabels[].columnKey The key of a column to update
     * @param {string} newLabels[].newLabel The new label to display
     */
    function editColumnLabels(newLabels) {
        if (!newLabels || newLabels.length === 0) return this;
        const newLabelsMap = newLabels.reduce((agg, newLabelObj) => {
            const { columnKey, newLabel } = newLabelObj;
            if (columnKey && newLabel) {
                agg[columnKey] = newLabel;
            }
            return agg;
        }, {});

        columnOperations.push(function (column) {
            if (newLabelsMap[column.key]) {
                column.label = newLabelsMap[column.key];
            }
        });

        return this;
    }

    /**
     * Toggles the enablement of the column header label click based on the provided edit type for one, many, or all columns.
     * This function can be used to undo the default behavior of sorting a column on header text click.
	 * It can also be used to add clickability to a custom added column, for example for a custom sort.
     *
     * @param {Object} editColumnsObj Object containing 'enable' and 'disable' properties.
     * @param {string[]} editColumnsObj.enable Array of column keys for which to enable column header click.
     * @param {string[]} editColumnsObj.disable Array of column keys for which to disable column header click.
     */
    function toggleColumnHeaderClickEnablement(editColumnsObj) {
        if (!editColumnsObj) return this;
        if (editColumnsObj[EditType.DISABLE])
            disableColumnHeaderClick(editColumnsObj[EditType.DISABLE]);
        if (editColumnsObj[EditType.ENABLE])
            enableColumnHeaderClick(editColumnsObj[EditType.ENABLE]);
        return this;
    }

    function disableColumnHeaderClick(columnKeyArr) {
        columnOperations.push(function(column) {
            if (!columnKeyArr || columnKeyArr.length === 0 || columnKeyArr.indexOf(column.key) !== -1) {
                column.headerTextDisabled = true;
            }
        });
        return this;
    }

    function enableColumnHeaderClick(columnKeyArr) {
        columnOperations.push(function(column) {
            if (!columnKeyArr || columnKeyArr.length === 0 || columnKeyArr.indexOf(column.key) !== -1) {
                column.headerTextDisabled = false;
            }
        });
        return this;
    }

    /**
     * Sets the tooltip text describing the action that is available for all column headers across the list on click.
     * Will not display on any columns that have column header click disabled.
     * It is not possible to set different text or different actions depending on the column. To avoid confusion for users, they should stay consistent.
     *
     * @param {string} text The new text to display in a tooltip on every column that conveys what action clicking triggers. If empty or falsy, all columns will be disabled and will not have a tooltip.
     */
    function setColumnHeaderClickActionText(text) {
        _columnDefinitionMutations.columnHeaderTextTooltip = text;
        return this;
    }

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
    function editColumnHeaderIcons(editIconsObj) {
        if (!editIconsObj) return this;
        if (editIconsObj[EditType.REMOVE])         
            removeColumnHeaderIcons(editIconsObj[EditType.REMOVE]);
        if (editIconsObj[EditType.ADD]) 
            addColumnHeaderIcons(editIconsObj[EditType.ADD]);
        return this;
    }

    function addColumnHeaderIcons(newIconsArray) {
        newIconsArray.forEach(({ columnKey, position, iconArr }) => {
            columnOperations.push(function (column) {
                if (!columnKey || column.key === columnKey) {
                    if (!column.icons) column.icons = {};
                    if (position === 'start') {
                        if (!column.icons.startIcons) column.icons.startIcons = [];
                        if (Array.isArray(iconArr)) {
                            column.icons.startIcons = column.icons.startIcons.concat(iconArr);
                        } else {
                            column.icons.startIcons.push(iconArr);
                        }
                    } else if (position === 'end') {
                        if (!column.icons.endIcons) column.icons.endIcons = [];
                        if (Array.isArray(iconArr)) {
                            column.icons.endIcons = column.icons.endIcons.concat(iconArr);
                        } else {
                            column.icons.endIcons.push(iconArr);
                        }
                    }
                }
            });
        });
        return this;
    }

    function removeColumnHeaderIcons(iconsToRemove) {
        if (!iconsToRemove || iconsToRemove.length === 0) {
            // Remove all icons from all positions
            columnOperations.push(column => {
                if (column.icons) {
                    if (column.icons.startIcons) {
                        column.icons.startIcons = [];
                    }
                    if (column.icons.endIcons) {
                        column.icons.endIcons = [];
                    }
                }
            });
            return this;
        }

        iconsToRemove.forEach(({ columnKey, position, iconIndexArr }) => {
            columnOperations.push(function (column) {
                if (!columnKey || column.key === columnKey) {
                    if (!column.icons) return;
                    if (!position || position === 'start') {
                        if (!column.icons.startIcons) return;
                        else if (iconIndexArr === null || !Array.isArray(iconIndexArr)) column.icons.startIcons = [];
                        else {
                            iconIndexArr.forEach(index => {
                                if (column.icons.startIcons[index]) {
                                    column.icons.startIcons.splice(index, 1);
                                }
                            });
                        }
                    }
                    if (!position || position === 'end') {
                        if (!column.icons.endIcons) return;
                        else if (iconIndexArr === null || !Array.isArray(iconIndexArr)) column.icons.endIcons = []
                        else {
                            iconIndexArr.forEach(index => {
                                if (column.icons.endIcons[index]) {
                                    column.icons.endIcons.splice(index, 1);
                                }
                            });
                        }
                    }
                }
            });
        });
        return this;
    }

    /**
     * Sets a column's aria-sort value.  This does not actually sort the data, just provides context to screen reader users if the data has already been sorted.
     * 
     * @param {string} columnKey The key of the column that will receive a new sort value. If empty or falsy, all columns will be set to "none" regardless of the value of the direction parameter.
     * @param {'ascending' | 'descending' | 'none'} direction The direction of the sort.
     */
    function setColumnSortDirection(columnKey, direction) {
        columnOperations.push(column => {
            if (!columnKey) {
                column.sortDirection = "none";
            }
            if (column.key === columnKey) {
                if (["none", "ascending", "descending"].indexOf(direction) === -1) {
                    column.sortDirection = "none";
                } else {
                    column.sortDirection = direction;
                }
            }
        });
        return this;
    }

    // /* BODY DATA VISUAL MUTATORS */

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
    function toggleColumnEnablement(editColumnObj) {
        if (!editColumnObj) return this;
        if (editColumnObj[EditType.DISABLE])
            disableColumns(editColumnObj[EditType.DISABLE]);
        if (editColumnObj[EditType.ENABLE])
            enableColumns(editColumnObj[EditType.ENABLE]);
        return this;
    }

    function disableColumns(columnKeyArr) {
        columnOperations.push(function(column, index) {
            // if the type of column is url, link or person or first column
            const isSpecialType = ['url', 'link', 'person'].indexOf(column.type) > -1 || index === 0;
            const isArrayFalsyOrEmpty = !columnKeyArr || columnKeyArr.length === 0;
            const isColumnInArray = columnKeyArr && columnKeyArr.indexOf(column.key) !== -1;

            if ((isArrayFalsyOrEmpty || isColumnInArray) && isSpecialType) {
                column.disabled = true;
            }
        });
        return this;
    }

    function enableColumns(columnKeyArr) {
        columnOperations.push(function(column, index) {
            // if the type of column is url, link or person or first column
            const isSpecialType = ['url', 'link', 'person'].indexOf(column.type) > -1 || index === 0;
            const isArrayFalsyOrEmpty = !columnKeyArr || columnKeyArr.length === 0;
            const isColumnInArray = columnKeyArr && columnKeyArr.indexOf(column.key) !== -1;
            
            if ((isArrayFalsyOrEmpty || isColumnInArray) && isSpecialType) {
                column.disabled = false;
            }
        });
        return this;
    }

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
    function toggleCellsEnablement(editCellsObj) {
        if (!editCellsObj) return this;
        if (editCellsObj[EditType.DISABLE])
            disableCells(editCellsObj[EditType.DISABLE]);
        if (editCellsObj[EditType.ENABLE])
            enableCells(editCellsObj[EditType.ENABLE]);
        return this;
    }

    function disableCells(cellArr) {
        if (!cellArr || !Array.isArray(cellArr) || cellArr.length === 0) return this;
        const cellKeyMap = cellArr.reduce((agg, cellKeyObj) => {
            const { rowKey, cellKey } = cellKeyObj;
            if (rowKey && cellKey) {
                if (!agg[rowKey]) agg[rowKey] = [];
                agg[rowKey].push(cellKey);
            }
            return agg;
        }, {});
        rowOperations.push(function(row) {
            if (row.cells && cellKeyMap[row.key]) {
                cellKeyMap[row.key].forEach((cellKey) => {
                    if (row.cells[cellKey]) {
                        row.cells[cellKey].disabled = true;
                    }
                });
            }
        });
        return this;
    }

    function enableCells(cellArr) {
        if (!cellArr || !Array.isArray(cellArr) || cellArr.length === 0) return this;
        const cellKeyMap = cellArr.reduce((agg, cellKeyObj) => {
            const { rowKey, cellKey } = cellKeyObj;
            if (rowKey && cellKey) {
                if (!agg[rowKey]) agg[rowKey] = [];
                agg[rowKey].push(cellKey);
            }
            return agg;
        }, {});
        rowOperations.push(function(row) {
            if (row.cells && cellKeyMap[row.key]) {
                cellKeyMap[row.key].forEach((cellKey) => {
                    if (row.cells[cellKey]) {
                        row.cells[cellKey].disabled = false;
                    }
                });
            }
        });
        return this;
    }

    /**
     * Changes the column width for one or many columns
     * This new width will remain in effect until the user manually resizes any column. If the user resizes a column, the manually adjusted width will take precedence.
     * Users can be prevented from resizing a column by setting `columnResizingEnabled` to false. Full doc: &lt;public url&gt;/now-list#public-props
     * 
     * @param {Object[] | string} newWidths Either an array representing all the columns to be edited and their respective new widths, or a string representing the width in px to be set for every column, eg '40px'.
     * @param {string} newLabels[].columnKey The key of a column to update
     * @param {string} newLabels[].newWidth The new width in px
     */
    function setColumnWidths(newWidths) {
        if (!newWidths || newWidths.length === 0) return this;
        if (!Array.isArray(newWidths)) {
            columnOperations.push(function (column) {
                column.width = newWidths;
            });
        }
        else {
            const newWidthsMap = newWidths.reduce((agg, newWidthObj) => {
                const { columnKey, newWidth } = newWidthObj;
                if (columnKey && newWidth) {
                    agg[columnKey] = newWidth;
                }
                return agg;
            }, {});

            columnOperations.push(function (column) {
                if (newWidthsMap[column.key]) {
                    column.width = newWidthsMap[column.key];
                }
            });
        }
        
        return this;
    }

    /**
     * Changes the maximum number of characters allowed to be displayed per cell before truncation for one or many columns
     * 
     * @param {Object[]} newMaxChars Either an array representing all the columns to be edited and their respective new maximum.
     * @param {string} newMaxChars[].columnKey The key of a column to update
     * @param {number} newMaxChars[].newMaxChars The new maximum characters in the column
     */
    function setColumnMaxCharacters(newMaxChars) {
        if(!newMaxChars || newMaxChars.length === 0) return this;
        const newMaxCharsMap = newMaxChars.reduce((agg, newMaxCharObj) => {
            const { columnKey, newMaxChars } = newMaxCharObj;
            if (columnKey && newMaxChars) {
                agg[columnKey] = newMaxChars;
            }
            return agg;
        }, {});
        columnOperations.push(function (column) {
            if (newMaxCharsMap[column.key]) {
                column.maxCharacters = newMaxCharsMap[column.key];
            }
        });
        return this;
    }

    /**
     * Sets highlighted values for cells
     * 
     * @param {Object[]} newHighlightedValues An array representing the highlighted values and the cell they should appear in.
     * @param {string} newHighlightedValues[].rowKey The key of a row containing the cell
     * @param {string} newHighlightedValues[].cellKey The key of a cell to set highlighted value
     * @param {Object} newHighlightedValues[].highlightedValueObj The object containing the highlighted value. Full highlighted value doc - &lt;public url&gt;/now-list/typeSchemas/rowDefinitions/cellsDocs.md#highlighted-value
     * TODO: add public urls for docs for cellDocs
     */
    function setHighlightedValues(newHighlightedValues) {
        if(!newHighlightedValues || newHighlightedValues.length === 0) return this;
        newHighlightedValues.forEach(({ rowKey, cellKey, highlightedValueObj }) => {
            rowOperations.push(function(row) {
                if (row.cells && row.cells[cellKey] && row.key === rowKey) {
                    row.cells[cellKey].highlightedValue = highlightedValueObj;
                }
            });
        });
        return this;
    }

    /**
     * Sets the display type for a person column: either avatar, name, or both. This function is not applicable to columns that are not the person type.
     * 
     * @param {Object[]} newDisplays An array representing the columns to update and their new display setting.
     * @param {string} newDisplays[].columnKey The key of a column to update
     * @param {'avatar'|'name'|'both'} newDisplays[].newDisplay Sets the appearance of body cells in this column. Can be 'avatar', 'name', or 'both'.
     */
    function changeDisplayForPersonColumn(newDisplays) {
        if(!newDisplays || newDisplays.length === 0) return this;
        const newDisplaysMap = newDisplays.reduce((agg, newDisplayObj) => {
            const { columnKey, newDisplay } = newDisplayObj;
            if (columnKey && newDisplay) {
                agg[columnKey] = newDisplay;
            }
            return agg;
        }, {});

        columnOperations.push(function (column) {
            if (newDisplaysMap[column.key] && column.type === 'person') {
                column.display = newDisplaysMap[column.key];
            }
        });

        return this;
    }

    /* CONTEXT ACTIONS MUTATORS */

    /**
     * Sets the numActionIcons property to determine the number of actions to render as icons. 
     * The first n items in the actionItems array will be rendered as icon buttons, and the rest will be hidden under a dropdown.
     * 
     * @param {number} numActionIcons Number of actions to render as icons
     */
    function setRowActionCountOverflow(numActionIcons) {
        _rowDefinitions.actions = _rowDefinitions.actions || {};
        _rowDefinitions.actions.numActionIcons = numActionIcons;
        return this;
    }

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
    function editRowActions(editActionsObj) {
        if (!editActionsObj) return this;
        if (editActionsObj[EditType.REMOVE])
            removeRowActions(editActionsObj[EditType.REMOVE]);
        if (editActionsObj[EditType.ADD])
            addRowActions(editActionsObj[EditType.ADD]);
        return this;
    }

    function removeRowActions(actionIDArr) {
        if (!actionIDArr || actionIDArr.length === 0) {
            _rowActionsMutations['removeAll'] = true;
        }
        else {
            _rowActionsMutations['remove'] = actionIDArr;
        }
        return this;
    }

    function addRowActions(actionObjArr) {
        if (!actionObjArr || actionObjArr.length === 0) return this;
        actionObjArr.sort(function (a, b) {
            if (a.index == null) return 1; 
            if (b.index == null) return -1;
            return a.index - b.index;
        });
        _rowActionsMutations['add'] = actionObjArr;
        return this;
    }

    /**
     * Toggles enablement/disablement one or many row actions on a row by row basis. Any disabled actions will be visible but not interactable.
     * 
     * @param {Object} editActionsObj An array of objects representing the row actions to be toggled.
     * @param {Object[]} editActionsObj[].disable An array of objects representing the row actions to be disabled. The specified action will be visible but not interactable.
     *   - @param {string} editActionsObj[].disable.rowKey The key of the row to update
     *   - @param {string[]} editActionsObj[].disable.actionIds An array of action keys that represent actions to disable.
     */
    function toggleRowActionsEnablement(editActionsObj) {
        if (!editActionsObj) return this;
        if (editActionsObj[EditType.DISABLE] && editActionsObj[EditType.DISABLE].length > 0) {
            const actionIdsMap = editActionsObj[EditType.DISABLE].reduce((agg, actionIdsToDisableObj) => {
                const { rowKey, actionIds } = actionIdsToDisableObj;
                if (rowKey && actionIds) {
                    agg[rowKey] = actionIds;
                }
                return agg;
            }, {});
            rowOperations.push(function(row) {
                if (actionIdsMap[row.key]) {
                    if (!row.excludedActions) {
                        row.excludedActions = [];
                    }
                    row.excludedActions = row.excludedActions.concat(actionIdsMap[row.key]);
                }
            });
        }
        return this;
    }

    /**
     * Updates the column header actions based on the provided edit type.
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
    function editColumnHeaderActions(editActionsObj) {
        if (!editActionsObj) return this;
        if (editActionsObj[EditType.REMOVE])
            removeColumnHeaderActions(editActionsObj[EditType.REMOVE]);
        if (editActionsObj[EditType.ADD])
            addColumnHeaderActions(editActionsObj[EditType.ADD]);
        return this;
    }

    function removeColumnHeaderActions(columnActionObjArr) {
        if (!columnActionObjArr || columnActionObjArr.length === 0) return this;
        const actionIdsMap = columnActionObjArr.reduce((agg, actionsObj) => {
            const { columnKey, actionIdArr } = actionsObj;
            if (columnKey && actionIdArr) {
                agg[columnKey] = actionIdArr;
            }
            return agg;
        }, {});
        columnOperations.push(function(column) {
            if (actionIdsMap[column.key] && column.columnHeaderActions) {
                actionIdsMap[column.key].forEach(actionID => {
                    column.columnHeaderActions = column.columnHeaderActions.filter(headerAction => headerAction.id !== actionID);
                });
            }
        });
        return this;
    }

    function addColumnHeaderActions(columnActionObjArr) {
        if (!columnActionObjArr || columnActionObjArr.length === 0) return this;
        const actionIdsMap = columnActionObjArr.reduce((agg, actionsObj) => {
            const { columnKey, actionObjArr } = actionsObj;
            if (columnKey && actionObjArr) {
                actionObjArr.sort(function (a, b) {
                    if (a.index == null) return 1; 
                    if (b.index == null) return -1;
                    return a.index - b.index;
                });
                agg[columnKey] = actionObjArr;
            }
            return agg;
        }, {});
        columnOperations.push(function(column) {
            if (actionIdsMap[column.key]) {
                if (!column.columnHeaderActions){
                    column.columnHeaderActions = [];
                }
                actionIdsMap[column.key].forEach(actionObj => {
                    const { id, label, action, index } = actionObj;
                    if (index != null && index >= 0 && index < column.columnHeaderActions.length) {
                        column.columnHeaderActions.splice(index, 0, { id, label, action });
                    } else {
                        column.columnHeaderActions.push({ id, label, action });
                    }
                });
            }
        });
        return this;
    }
    
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
    function editCellActionsForColumn(editActionsObj) {
        if (!editActionsObj) return this;
        if (editActionsObj[EditType.REMOVE])
            removeCellActionsForColumn(editActionsObj[EditType.REMOVE]);
        if (editActionsObj[EditType.ADD])
            addCellActionsForColumn(editActionsObj[EditType.ADD]);
        return this;
    }

    function removeCellActionsForColumn(cellActionObjArr) {
        columnOperations.push(function(column) {
            if (!column.cellActions) return;
            if (!cellActionObjArr || cellActionObjArr.length === 0) {
                column.cellActions = [];
                return;
            }
            cellActionObjArr.forEach((actionObj) => {
                if (!actionObj.actionIdArr || actionObj.actionIdArr.length === 0) {
                    if(!actionObj.columnKey || actionObj.columnKey === column.key) {
                        column.cellActions = [];
                    }
                }
                else if (!actionObj.columnKey || actionObj.columnKey === column.key) {
                    actionObj.actionIdArr.forEach(actionID => {
                        column.cellActions = column.cellActions.filter(headerAction => headerAction.id !== actionID);
                    });
                }
            });
        });
        return this;
    }

    function addCellActionsForColumn(cellActionObjArr) {
        if (!cellActionObjArr || cellActionObjArr.length === 0) return this;
        const cellActionsMap = cellActionObjArr.reduce((agg, actionsObj) => {
            const { columnKey, actionObjArr } = actionsObj;
            if (columnKey && actionObjArr) {
                actionObjArr.sort(function (a, b) {
                    if (a.index == null) return 1; 
                    if (b.index == null) return -1;
                    return a.index - b.index;
                });
                agg[columnKey] = actionObjArr;
            }
            return agg;
        }, {});
        columnOperations.push(function(column) {
            if (cellActionsMap[column.key]) {
                if (!column.cellActions){
                    column.cellActions = [];
                }
                cellActionsMap[column.key].forEach(actionObj => {
                    const { id, label, action, index } = actionObj;
                    if (index != null && index >= 0 && index < column.cellActions.length) {
                        column.cellActions.splice(index, 0, { id, label, action });
                    } else {
                        column.cellActions.push({ id, label, action });
                    }
                });
            }
        });
        return this;
    }

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
    function editOverrideCellActions(editActionsObj) {
        if (!editActionsObj) return this;
        if (editActionsObj[EditType.REMOVE])
            removeOverrideCellActions(editActionsObj[EditType.REMOVE]);
        if (editActionsObj[EditType.ADD])
            addOverrideCellActions(editActionsObj[EditType.ADD]);
        return this;
    }

    function removeOverrideCellActions(cellActionObjArr) {
        if (!cellActionObjArr || cellActionObjArr.length === 0) return this;
        cellActionObjArr.forEach(({ rowKey, cellKey, actionIdArr }) => {
            rowOperations.push(function(row) {
                if (row.cells && row.cells[cellKey] && row.key === rowKey && row.cells[cellKey].actions) {
                    actionIdArr.forEach(actionID => {
                        row.cells[cellKey].actions = row.cells[cellKey].actions.filter(cellActions => cellActions.id !== actionID);;
                    });
                }
            });
        });
        return this;
    }

    function addOverrideCellActions(cellActionObjArr) {
        if (!cellActionObjArr || cellActionObjArr.length === 0) return this;
        cellActionObjArr.forEach(({ rowKey, cellKey, actionObjArr }) => {
            rowOperations.push(function(row) {
                if (row.cells && row.cells[cellKey] && row.key === rowKey) {
                    if (!row.cells[cellKey].actions) {
                        row.cells[cellKey].actions = [];
                    }
                    if (actionObjArr) {
                        actionObjArr.sort(function (a, b) {
                            if (a.index == null) return 1; 
                            if (b.index == null) return -1;
                            return a.index - b.index;
                        });
                        actionObjArr.forEach(({ id, label, action, index }) => {
                            if (index != null && index >= 0 && index < row.cells[cellKey].actions.length) {
                                row.cells[cellKey].actions.splice(index, 0, { id, label, action });
                            } else {
                                row.cells[cellKey].actions.push({ id, label, action });
                            }
                        });
                    }
                }
            });
        });
        return this;
    }

    /* GROUPS MUTATORS */

    /**
     * Sets the expanded state of one or more groups
     * 
     * @param {Object[]} groupObjectArr An array of objects representing the group and its respective expanded state
     * @param {string} groupObjectArr[].groupKey The key of the group to update
     * @param {boolean} groupObjectArr[].isExpanded The expanded state of the group
     */
    function setGroupsExpandedState(groupObjectArr) {
        if (!groupObjectArr || groupObjectArr.length === 0) return this;
        const groupsMap = groupObjectArr.reduce((agg, groupObj) => {
            const { groupKey, isExpanded } = groupObj;
            if (groupKey) {
                agg[groupKey] = isExpanded;
            }
            return agg;
        }, {});
        rowOperations.push(function(row) {
            if (groupsMap[row.key]) {
                row.isGroupExpanded = groupsMap[row.key];
            }
        });
        return this;

    }

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
    function editGroupActions(editActionsObj) {
        if (!editActionsObj) return this;
        if (editActionsObj[EditType.REMOVE])
            removeGroupActions(editActionsObj[EditType.REMOVE]);
        if (editActionsObj[EditType.ADD])
            addGroupActions(editActionsObj[EditType.ADD]);
        return this;
    }

    function removeGroupActions(groupObjectArr) {
        if (!groupObjectArr || groupObjectArr.length === 0) {
            rowOperations.push(function (group) {
                if (group.type === 'grouped' && group.groupActions) {
                    group.groupActions = [];
                }
            });
            return this;
        }
        groupObjectArr.forEach(({ groupKey, actionIdArr }) => {
            rowOperations.push(function (group) {
                if (group.type === 'grouped' && group.groupActions && (!groupKey || group.key === groupKey)) {
                    if ( !actionIdArr ) {
                        group.groupActions = [];
                    }
                    else {
                        actionIdArr.forEach(actionID => {
                            group.groupActions = group.groupActions.filter(action => action.id !== actionID);
                        });
                    }
                }
            });
        });
        return this;
    }

    function addGroupActions(groupObjectArr) {
        groupObjectArr.forEach(({ groupKey, actionObjArr }) => {
            rowOperations.push(function (group) {
                if (group.type === 'grouped' && (!groupKey || group.key === groupKey)) {
                    if (!group.groupActions){
                        group.groupActions = [];
                    }
                    if (actionObjArr)  {
                        actionObjArr.sort(function (a, b) {
                            if (a.index == null) return 1; 
                            if (b.index == null) return -1;
                            return a.index - b.index;
                        });
                        actionObjArr.forEach(({ id, label, action, index}) => {
                            if (index != null && index >= 0 && index < group.groupActions.length)  {
                                group.groupActions.splice(index, 0, { id, label, action });
                            }
                            else {
                                group.groupActions.push({ id, label, action });
                            }
                        });
                    }
                }
            });
        });
        return this;
    }

    /* DECLARATIVE ACTIONS MUTATORS */

    function filterDAsRequiringSelection(actions) {
        return actions.filter(function (action) {
            if (action.recordSelectionRequired === true) {
                return false;
            }
            if (action.groupedActions) {
                action.groupedActions = filterDAsRequiringSelection(action.groupedActions);
                if (action.groupedActions.length === 0) {
                    return false;
                }
            }
            return true;
        });
    }

    /**
     * Hides declarative actions that require record selection
     */
    function hideDAsRequiringSelection() {
        _hideDAsRequiringSelection = true;
        return this;
    }

     /* HELPERS */

    function transform() {
        columnAdditions.forEach(function({index,column,columnData}) {
            if (!column) return;
            var columnKey = column.key;
            if (!column.metadata) {
                column.metadata = {};
            }
            // Set the 'transformScriptNewColumn' property to true to indicate that it is a column added by the transform script
            column.metadata['transformScriptNewColumn'] = true;
            //Disabling sorting for this column
            disableColumnHeaderClick(columnKey);
            if (index != null && index >= 0 && index < _columnDefinitions.columns.length) {
                _columnDefinitions.columns.splice(index,0,column);
            }
            else 
                _columnDefinitions.columns.push(column);
            if (columnData && columnData.length > 0) {
                columnData.forEach(function ({ rowKey, cellValue }) {
                    addCellValues(columnKey, rowKey, cellValue);
                });
            }
        });

        _columnDefinitions.columns.forEach(function(column, index) { 
			columnOperations.forEach(function(executeOperation) {
                executeOperation(column, index);
            });

		});

        _rowDefinitions.rows.forEach(function(row) { 
			rowOperations.forEach(function(executeOperation) {
                executeOperation(row);
                if (row.children && row.children.length > 0) {
                    row.children.forEach(function(childRow) {
                        executeOperation(childRow);
                    });
                }
            });
            
		});

        if (_hideDAsRequiringSelection) {
            _declarativeActions = filterDAsRequiringSelection(_declarativeActions);
        }

        for (var key in _columnDefinitionMutations) {
            _columnDefinitions[key] = _columnDefinitionMutations[key];
        }

        for (let type in _rowActionsMutations) {
            if (_rowActionsMutations[type].length === 0) continue;

            if (!_rowDefinitions.actions) {
                _rowDefinitions.actions = {};
            }
            if (!_rowDefinitions.actions.actionsItems) {
                _rowDefinitions.actions.actionsItems = [];
            }

            if (type === 'add') {
                _rowActionsMutations.add.forEach(actionObj => {
                    const { id, icon, label, action, index } = actionObj;
                    if (index != null && index >= 0 && index < _rowDefinitions.actions.actionsItems.length) {
                        _rowDefinitions.actions.actionsItems.splice(index, 0, { id, icon, label, action });
                    } else {
                        _rowDefinitions.actions.actionsItems.push({ id, icon, label, action });
                    }
                });
            } else if (type === 'removeAll' && _rowActionsMutations[type])  {
                _rowDefinitions.actions.actionsItems = [];
            } else if (type === 'remove') {
                _rowDefinitions.actions.actionsItems = _rowDefinitions.actions.actionsItems.filter(function(actionItem) {
                    return _rowActionsMutations.remove.indexOf(actionItem.id) === -1;
                });
            }
        }

        return {
            rowDefinitions: _rowDefinitions,
            columnDefinitions: _columnDefinitions,
            overlayDefinition: _overlayDefinition,
            tableName: _tableName,
            shouldAggregatesRowBeSticky: _shouldAggregatesRowBeSticky
        };
    }

    return {
        // constructor
        initialize: initialize,
        
        // getters/setters
        get rowDefinitions() {
            return getRowDefinitions();
        },
        setRowDefinitions: setRowDefinitions,
        get columnDefinitions() {
            return getColumnDefinitions();
        },
        setColumnDefinitions: setColumnDefinitions,
        get overlayDefinition() {
            return getOverlayDefinition();
        },
        setOverlayDefinition: setOverlayDefinition,
        setFeatureFlags: setFeatureFlags,
        setTableName: setTableName,
        get tableName() {
            return getTableName();
        },

        // mutators
        addColumns: addColumns,
        toggleColumnEnablement: toggleColumnEnablement,
        toggleCellsEnablement: toggleCellsEnablement,
        editColumnLabels: editColumnLabels,
        changeDisplayForPersonColumn: changeDisplayForPersonColumn,
        toggleColumnHeaderClickEnablement: toggleColumnHeaderClickEnablement,
        setColumnHeaderClickActionText: setColumnHeaderClickActionText,
        editColumnHeaderIcons:editColumnHeaderIcons,
        setColumnWidths: setColumnWidths,
        setColumnMaxCharacters: setColumnMaxCharacters,
        setHighlightedValues: setHighlightedValues,
        setGroupsExpandedState: setGroupsExpandedState,
        editGroupActions: editGroupActions,
        hideDAsRequiringSelection: hideDAsRequiringSelection,
        setRowActionCountOverflow: setRowActionCountOverflow,
        editRowActions: editRowActions,
        toggleRowActionsEnablement: toggleRowActionsEnablement,
        editColumnHeaderActions: editColumnHeaderActions,
        editCellActionsForColumn: editCellActionsForColumn,
        editOverrideCellActions: editOverrideCellActions,
        disableCalculationsRowStickyBehavior: disableCalculationsRowStickyBehavior,
        
        // execute transform, return model
        transform: transform,

        type: 'ListTransformScriptBuilder'
    };

})();
