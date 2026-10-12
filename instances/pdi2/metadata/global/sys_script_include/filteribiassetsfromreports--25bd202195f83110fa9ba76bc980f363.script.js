var FilterIBIAssetsFromReports = Class.create();
FilterIBIAssetsFromReports.prototype = {
	initialize: function() {},

	type: 'FilterIBIAssetsFromReports',
};
FilterIBIAssetsFromReports.DATABASE_VIEW = 'my_company_assets';
FilterIBIAssetsFromReports.IBI_EXCLUSION_PROP = 'sn_itam_exclude_ibi_asset_reporting';
/* Exclude IBI assets from important actions and reports. Write query as per requirement.
Return GlideRecord object */
FilterIBIAssetsFromReports.excludeIBIAssets = function(assetGr) {
	if (assetGr.getTableName() === FilterIBIAssetsFromReports.DATABASE_VIEW) {
		/** append prefix of the view i.e 'ast' to the fields in the query. View is for reports.
         ** assetGr.addQuery('','');
         * */
	} else {
		/** Important actions query
         ** assetGr.addQuery('','');
         * */
	}
	return assetGr;
};
