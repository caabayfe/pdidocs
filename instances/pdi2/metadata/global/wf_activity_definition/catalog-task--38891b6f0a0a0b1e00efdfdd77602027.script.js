// Workflow activity definition handler class
//
// Implement activity definition handling in the onExecute method

// Implement any event handlers for the activity definition as a method named 'on[event_name]'
//     For example, to handle the 'cancel' event, implement an 'onCancel' method
//

workflow.includeActivityDefinition("Create Task");

var Catalog_TaskActivityHandler = Class.create();
Catalog_TaskActivityHandler.prototype = Object.extendsObject(Create_TaskActivityHandler, {

    initialize: function() {
        Create_TaskActivityHandler.prototype.initialize.call(this);
    },

    onExecute: function() {
        Create_TaskActivityHandler.prototype.onExecute.call(this);
        if (activity.scratchpad.taskID) {
            this._linkTaskToItemVariables();
        }
    },

    _linkTaskToItemVariables: function() {
        var itemNames = [];
        var wfNames = [];
        var names = (activity.vars.task_variables + '').split(',');
        for (var i = 0; i < names.length; i++) {
            if (names[i].startsWith('wf.'))
                wfNames.push(names[i].split('.')[1]);
            else if (names[i])
                itemNames.push(names[i]);
        }

        if (itemNames.length > 0)
            this._getVariables(itemNames);

        if (wfNames.length > 0)
            this._getWFVars(wfNames);
    },

    _getWFVars: function(names) {
        var vars = new GlideRecord("wf_variable");
        vars.addQuery('name', names);
        vars.addQuery('workflow', context.workflow_version.sys_id);
        vars.query();
        while (vars.next()) {
            this._insertVariable(vars.sys_id);
        }
    },

    _getVariables: function(names) {
        var sets = [];
        var setsGr = new GlideRecord('io_set_item');
        setsGr.addQuery('sc_cat_item', current.cat_item);
        setsGr.query();
        while (setsGr.next())
            sets.push(setsGr.getValue('variable_set'));

        var varsGr = new GlideRecord('item_option_new');
        var or1 = varsGr.addQuery('cat_item', current.cat_item);
        or1.addOrCondition('variable_set', sets);

        var or2 = varsGr.addQuery('name', names);
        or2.addOrCondition('variable_set.internal_name', names);

        varsGr.query();
        while (varsGr.next())
            this._insertVariable(varsGr.getUniqueValue());
    },

    _insertVariable: function(id) {
        var gr = new GlideRecord('sc_item_variables_task');
        gr.initialize();
        gr.setValue('task', activity.scratchpad.taskID);
        gr.setValue('variable', id);
        gr.insert();
    },

    type: 'Catalog_TaskActivityHandler'
});
