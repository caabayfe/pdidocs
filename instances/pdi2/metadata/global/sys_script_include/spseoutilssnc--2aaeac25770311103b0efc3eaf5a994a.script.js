var SPSEOUtilsSNC = Class.create();
SPSEOUtilsSNC.prototype = {
	initialize: function() {},
	
    type: 'SPSEOUtilsSNC'
};

SPSEOUtilsSNC.getPortalId = function() {
	return new GlideSPUtil().getPortal().getValue("sys_id");
};

SPSEOUtilsSNC.getPageRecordWithPageRoute = function(pageId, portalId, preventReRoute) {
	return new GlideSPUtil().getPageRecordWithPageRoute(pageId, portalId, preventReRoute);
};

SPSEOUtilsSNC.getHumanReadableUrlForCurrentRequest = function() {
	return new GlideSPUtil().getHumanReadableUrl();
};

SPSEOUtilsSNC.getHumanReadableUrl = function(pageGR, queryString) {
	return new GlideSPUtil().getHumanReadableUrl(pageGR, queryString);
};
