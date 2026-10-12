var ci_admin_console_utility = Class.create();
ci_admin_console_utility.prototype = {
    initialize: function() {},

    profileSearchRowCount: function(contextProfileSysId) {
        var profile_search = new GlideRecord("sys_cs_context_profile_search");
        profile_search.addQuery('context_profile', '=', contextProfileSysId);
        profile_search.query();
        return profile_search.hasNext();
    },

    type: 'ci_admin_console_utility'
};
