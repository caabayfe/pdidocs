var TodosFilterClientUtilSNC = Class.create();
TodosFilterClientUtilSNC.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

    isChildFilter: function() {
        var filter = this.getParameter('sysparm_filter');
        var gr = new GlideRecord('sn_hr_sp_todo_filter_m2m_filter');
        gr.addQuery('todo_child_filter', filter);
        gr.setLimit(1);
        gr.query();
        if (gr.hasNext())
            return true;
        return false;
    },

    checkForAssociatedSubFilters: function() {
        var filter = this.getParameter('sysparm_filter');
        var gr = new GlideRecord('sn_hr_sp_todo_filter_m2m_filter');
        gr.addQuery('todo_parent_filter', filter);
        gr.query();
        if (gr.hasNext()) {
            return true;
        }
        return false;
    },

    checkForAssociatedConditions: function() {
        var filter = this.getParameter('sysparm_filter');
        var gr = new GlideRecord('sn_hr_sp_todo_filter_m2m_condition');
        gr.addQuery('todo_filter', filter);
        gr.query();
        if (gr.hasNext()) {
            return true;
        }
        return false;
    },

    type: 'TodosFilterClientUtilSNC'
});
