var SPRefQualUtils = Class.create();
SPRefQualUtils.prototype = {
    initialize: function() {
    },
	getThemeReferenceQualifier: function(portalId) {
		var supportedPortals = gs.getProperty('glide.sp.polaris.theme.allowed.portals').split(',');
		if (supportedPortals.indexOf(portalId) == -1)
			return 'sys_id!=' + gs.getProperty('glide.sp.polaris.theme.portal_id') + '^EQ';
	},
    type: 'SPRefQualUtils'
};
