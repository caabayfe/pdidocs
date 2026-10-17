var CSDMUtil = Class.create();
CSDMUtil.prototype = {
    initialize: function() {
    },

    type: 'CSDMUtil'
};

CSDMUtil.isCSDMSupportActivationInstalled = function() {
		return GlidePluginManager.isActive('com.snc.cmdb.csdm.activation');
};
