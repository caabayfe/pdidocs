(function(action) {
	// Extract URI params
    var uri = action.getGlideURI();
    var view = uri.get('sysparm_view');
    var taxonomyNodeSysId = uri.get('sysparm_collectionID');

    var portfolioSysId;
    var portfolio = new GlideRecord('spm_taxonomy_node');
    portfolio.get(taxonomyNodeSysId);
    portfolioSysId = portfolio.spm_service_portfolio.sys_id;

	// Set params for redirect to UI Page
    var uiPageSysId = '035b64e30f92201049fbcc11ff767e74'; // service_creation UI Page
	var taxonomyNodeParam = '&sysparm_taxonomy=' + taxonomyNodeSysId;
	var portfolioParam = '&sysparm_portfolio=' + portfolioSysId;
	var viewParam = '&sysparm_view=' + view;
    var uiPageUrl = '/ui_page.do?sys_id=' + uiPageSysId + taxonomyNodeParam + portfolioParam + viewParam;
    action.setRedirectURL(uiPageUrl);
})(action);
