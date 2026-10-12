var MenuReferenceQualifier = Class.create();
MenuReferenceQualifier.prototype = {
    initialize: function() {},
    filterMenus: function() {
        var filter = 'type!=system';
        if (!gs.hasRole("maint")) {
            filter += '^type!=snc_internal';
        }
        return filter;
    },
    type: 'MenuReferenceQualifier'
};
