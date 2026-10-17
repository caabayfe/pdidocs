/**
 * Return the list of available variables for a Workflow Catalog Task activity
 * 
 * The list of variables consists of all unique names of variables for each item that
 * is using the current workflow.  If no items currently have the workflow assigned,
 * then all available variable names are shown
 *
 * Note: the list of names are returned as a choice list in 'answer'
 */
function wf_variables() {
    var catItems = {};
    var variables = {};
    var items = new GlideRecord('sc_cat_item');
    items.addQuery('workflow', current.workflow_version.workflow);
    items.query();
    if (!items.hasNext()) {
        //no items have workflows, default to all variables
        addDefaultVariables(variables);
    } else {
        while (items.next()) {
            catItems[items.sys_id.toString()] = items.sys_id.toString();
        }
        addVariableSets(catItems, variables);
    }
    addWFVariables(variables); //explicitly add variables from workflow
    for (var variable in variables) {
        answer.add(variable, variables[variable]);
    }
}
//Collect all the Variable Sets associated with Scervice Catalogs
function addVariableSets(catItems, variables) {
    var variableSets = {};
    for (var catItem in catItems) {
        var sets = new GlideRecord('io_set_item');
        sets.addQuery('sc_cat_item', catItems[catItem]);
        sets.addNotNullQuery('variable_set');
        sets.groupBy('variable_set');
        sets.query();
        while (sets.next()) {
            if (sets.variable_set.type.toString() == 'one_to_one')
                variableSets[sets.variable_set.toString()] = sets.variable_set.toString();
            else
                variables[sets.variable_set.internal_name.toString()] = sets.variable_set.internal_name.toString();
        }
    }
    addVariables(catItems, variableSets, variables);
}
//Add variables for service Catalogs and Variable Sets
function addVariables(catItems, variableSets, variables) {
    var scCatItemIds = [];
    for (var catItem in catItems) {
        scCatItemIds.push(catItems[catItem]);
    }
    var scCatItemIdsList = scCatItemIds.join();
    var variableSetIds = [];
    for (var variableSet in variableSets) {
        variableSetIds.push(variableSets[variableSet]);
    }
    var variableSetIdsList = variableSetIds.join();
    var itemVars = new GlideRecord('item_option_new');
    var or = itemVars.addQuery('cat_item', 'IN', scCatItemIdsList);
    or.addOrCondition('variable_set', 'IN', variableSetIdsList);
    itemVars.addNotNullQuery('name');
    itemVars.query();
    while (itemVars.next()) {
        variables[itemVars.name.toString()] = itemVars.name.toString();
    }
}
//no items have workflows, default to all variables
function addDefaultVariables(variables) {
    var itemVars = new GlideRecord('item_option_new');
    itemVars.addNotNullQuery('name');
    var or = itemVars.addNullQuery('variable_set');
    or.addOrCondition('variable_set.type', 'one_to_one');
    itemVars.query();
    while (itemVars.next()) {
        if (itemVars.name != '') {
            variables[itemVars.name.toString()] = itemVars.name.toString();
        }
    }
    var setVars = new GlideRecord('item_option_new_set');
    setVars.addNotNullQuery('internal_name');
    setVars.query();
    while (setVars.next()) {
        if (setVars.internal_name != '') {
            variables[setVars.internal_name.toString()] = setVars.internal_name.toString();
        }
    }
}
//explicitly add variables from workflow
function addWFVariables(variables) {
    var wfVars = new GlideRecord('wf_variable');
    wfVars.addQuery('workflow', current.workflow_version);
    wfVars.query();
    while (wfVars.next()) {
        if (wfVars.name != '')
            variables['wf.' + wfVars.name.toString()] = gs.getMessage('Workflow') + ': ' + wfVars.name.toString();
    }
}
