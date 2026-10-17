/***
 *  retrieve the variables from the dialog.
 *  returns the key:value pairs of variables.
 *  key : variable_sysId
 *  value : object with value & displayValue, displayValue doesn't exist if displayBox doesn't exist for the variable
 */
function getVariablesFromDialog( /* TableVariable */ tableVariable) {
    if (!tableVariable)
        return;
    var namespace = tableVariable.getNameSpace();
    var optionsElements = gel('table_variable_sequence').value.split(',');
    var variables = {};

    for (i = 0; i < optionsElements.length; i++) {
        var id = optionsElements[i];
        var nameSpaceId = namespace + id;
        // for reference displayBox contains displayValue
        var displayBox = gel('sys_display.' + nameSpaceId);
        var hiddenBox = gel(nameSpaceId);
        if (!hiddenBox)
            continue;
        var colElement = {
            value: ''
        };
        if (hiddenBox.type == 'radio' || (hiddenBox.hasAttribute('type') && hiddenBox.getAttribute('type') == 'radio')) {
            var selectedOption = $(nameSpaceId).querySelector("input[name='" + nameSpaceId + "']:checked");
            if (selectedOption) {
                colElement.value = selectedOption.value;
                // If value is empty don't honor labels
                if (colElement.value != '' && selectedOption.labels) {
                    colElement.displayValue = selectedOption.labels[0] ? selectedOption.labels[0].innerText : "";
                }
            }
        } else if (hiddenBox.type != "undefined" && hiddenBox.type == 'select-one') {
            var options = hiddenBox.options;
            var selectedIndex = hiddenBox.selectedIndex;
            if (selectedIndex > -1 && options.length > selectedIndex) {
                colElement.value = options[selectedIndex].value;
                // If the value is empty, don't render the Label. 
                // Even for lookup selectBox, we map label & value to two different columns (value being mandatory & label is not), if there is no value associated with the label, we are not honoring that, its upto them to configure those entries.
                if (colElement.value != '')
                    colElement.displayValue = options[selectedIndex].label;
            }
        } else if (hiddenBox.hasAttribute("data-type") && hiddenBox.getAttribute("data-type") == 'duration') {
            var value = hiddenBox.value;
            var displayValue = hiddenBox.value;
            // check whether Duration API is available
            if (GlideDuration) {
                var displayBoxParts = GlideDuration.parseDurationToParts(value);
                if (displayBoxParts && displayBoxParts.size() == 4) {
                    // ignore seconds, we are not supporting
                    var d = displayBoxParts[0];
                    var h = displayBoxParts[1];
                    var m = displayBoxParts[2];
                    var s = displayBoxParts[3];
                    displayValue = ((d > 0) ? d + ' ' : '') + h + ':' + m + ':' + s;
                }
            }
            colElement.value = value;
            colElement.displayValue = displayValue;
        } else if (hiddenBox.hasAttribute("data-type") && hiddenBox.getAttribute("data-type") == 'glide-list') {
            var selectedElements = gel('select_0' + nameSpaceId);
            if (selectedElements) {
                selectedElements = selectedElements.options;
                var selectedElementsDisplayValue = [];
                for (j = 0; j < selectedElements.length; j++)
                    selectedElementsDisplayValue.push(selectedElements[j].innerText);
            }
            colElement.value = hiddenBox.value;
            colElement.displayValue = selectedElementsDisplayValue;
        } else {
            if (displayBox) {
                colElement.displayValue = displayBox.value;
                if (displayBox.hasAttribute("data-type") && displayBox.getAttribute("data-type") == 'catalog_masked')
                    colElement.displayValue = "********";
            } else {
                // `readonlyBox` will give display value in readonly template, even for masked var
                var readonlyBox = gel(nameSpaceId + '_read_only');
                if (readonlyBox)
                    colElement.displayValue = readonlyBox.value;
                else
                    colElement.displayValue = hiddenBox.value;
            }

            if (hiddenBox && hiddenBox.hasAttribute('data-type') && hiddenBox.getAttribute('data-type') === 'checkbox' && typeof getMessage === 'function')
                colElement.displayValue = hiddenBox.value == 'true' ? getMessage('true') : getMessage('false');

            colElement.value = hiddenBox.value;
        }
        variables[id] = colElement;
    }
    return variables;
}


function saveDialog(tableVariableId, tableVariableNodeId, action, sourceId) {
    var dialog = window.catalog_table_dialog;
    var parentGFormData;
    if (window.g_service_catalog)
        parentGFormData = window.g_service_catalog.parent;
    if (dialog) {
        var tableVariable = TableVariableService.get(tableVariableId, sourceId);
        if (!tableVariable) {
            //Should we print an Errror !
            return;
        }
        var variables = getVariablesFromDialog(tableVariable);
        var duplicateUniqueFields = TableVariableService.getDuplicateUniqueFields(tableVariable, tableVariableNodeId, variables, parentGFormData);
        if (duplicateUniqueFields.length > 0) {
            var alertText = new GwtMessage().getMessage('Some fields are not unique: {0}', duplicateUniqueFields.join(', '));
            g_form.addErrorMessage(alertText);
            return;
        }
        if (!g_form.catalogOnSubmit())
            return;

		// Submit handlers might add a value after the values are fetched from dom.
        variables = getVariablesFromDialog(tableVariable);
        var row;
        if (action == 'create') {
            row = new TableVariableRow(tableVariable, variables, tableVariableNodeId);
            if (tableVariable.isEmpty())
                tableVariable.deleteEmptyValueDisplayRow();
            var newRowIndex = tableVariable && tableVariable.rows && tableVariable.rows.length + 1 || 1;
            var tr = row.buildRowHtmlFromDialog(newRowIndex);
            tableVariable.addRow(row, tr);
        } else if (action == 'update') {
            row = tableVariable.getRow(tableVariableNodeId);
            if (row) {
                row.setData(variables);
                row.updateRowHtmlFromDialog();
                tableVariable.updateRow(row);
            }
        }
        TableVariableService.notifyOperation(action, tableVariableId, sourceId);
        dialog.destroy();
    } else {
        //
    }
}

function closeDialog() {
    window.catalog_table_dialog.destroy();
}

var SN_SC = new(Class.create({
    getPricingController: function() {
        if (typeof this._priceController != 'undefined')
            return this._priceController;
        this._pricingController = new CatalogPricingV2(this.getTableVariableId(), this.getCartProxy());
        return this._pricingController;
    },
    getForm: function() {
        if (window['g_form'])
            return window['g_form'];
        return null;
    },
    getTableVariableId: function() {
        return '$[sysparm_table_variable_id]';
    },
    getCartProxy: function() {
        if (typeof this._cart != 'undefined')
            return this._cart;
        this._cart = new SCCart();
        return this._cart;
    },
    getOrderItemWidgetProxy: function() {
        if (typeof this._orderItemWidget != 'undefined')
            return this._orderItemWidget;
        this._orderItemWidget = {
            calcPrice: function() {
                //We only need to enhance labels of variables
                SN_SC.getPricingController()._getAllPrices();
            }
        };
        return this._orderItemWidget;
    },
}))();
var orderItemWidget = SN_SC.getOrderItemWidgetProxy();
var g_cart = SN_SC.getCartProxy();
orderItemWidget.g_cart = g_cart;
