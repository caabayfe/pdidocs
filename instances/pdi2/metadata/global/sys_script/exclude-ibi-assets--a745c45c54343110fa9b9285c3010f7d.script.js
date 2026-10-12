(function executeRule(current, previous /* null when async */) {
	/* Query BR applies to my_company_assets database view. Write the query to exclude IBI assets
	as per requirement */
	global.FilterIBIAssetsFromReports.excludeIBIAssets(current);
}(current, previous));
