var DomainJobTypeUtil = Class.create();
DomainJobTypeUtil.prototype = {
    initialize: function() {},

    getNextAutoResumeInMinutes: function() {
        var triggerGr = new GlideRecord('sys_trigger');
        triggerGr.addQuery('name', 'ASYNC: Auto resume domain_hierarchy_changes');
        triggerGr.addQuery('state', '0');
        triggerGr.query();
        if (!triggerGr.next()) {
            return null;
        }
        var d = GlideDateTime.subtract(new GlideDateTime(), new GlideDateTime(triggerGr.next_action));
        var minutes = d.getNumericValue() / (60 * 1000);
        return '' + Math.ceil(minutes);
    },

    type: 'DomainJobTypeUtil'
};
