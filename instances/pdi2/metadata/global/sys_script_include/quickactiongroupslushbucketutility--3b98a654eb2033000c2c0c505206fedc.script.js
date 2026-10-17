var QuickActionGroupSlushBucketUtility = Class.create();
QuickActionGroupSlushBucketUtility.prototype = {
    initialize: function() {},

    fetchGroups: function() {
        var result = [];
        var gr = new GlideRecord('sys_user_group');
        gr.addActiveQuery();
        gr.query();
        while (gr.next()) {
            result.push({
                'id': gr.getValue('sys_id'),
                'label': gr.getValue('name')
            });
        }
        return result;
    },
    getUserGroup: function() {
        var groups = this.fetchGroups();
        groups.forEach(function(group) {
            answer.add(group.id, group.label);
        });
    },

    type: 'QuickActionGroupSlushBucketUtility'
};
