var SNCGlobalCatalogUtil = Class.create();
SNCGlobalCatalogUtil.prototype = {
    initialize: function() {
    },  
	getUsersFromGroup: function(group) {
        return new SNCCatalogUtil().getUsersFromGroup(group);
    },
    type: 'SNCGlobalCatalogUtil'
};
