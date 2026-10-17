answer = getCumulativePredictionsCount();


function getCumulativePredictionsCount() {
	var totalCount = 0;			
	var license_start_month = getLicenseStartMonth();
	var previous_month = gs.beginningOfLastMonth().slice(0, 7);
	
	if(!hasRequiredTableAndColumns() || gs.nil(license_start_month))
		return 0;
	
	var agg = new GlideAggregate('ua_event_stat');
	agg.addQuery('event_id', 'ml.predictions');
	agg.addQuery('time_stamp', '>=', license_start_month);
	agg.addQuery('time_stamp', '<=', previous_month);
	agg.addAggregate('SUM', 'event_count');
	agg.setGroup(false);
	agg.query();
	if (agg.next()) 
	   totalCount = agg.getAggregate('SUM', 'event_count');
	return totalCount;
}


function getLicenseStartMonth() {
	var license_start_date = SNC.UsageAnalyticsScriptUtils.getLicenseStartDateForApp('com.glide.platform_ml');
	return gs.nil(license_start_date) || license_start_date.length < 7  ? '' : license_start_date.substring(0, 7);
}


function hasRequiredTableAndColumns() {
	return GlideTableDescriptor.isValid('ua_event_stat') && 
		GlideTableDescriptor.fieldExists('ua_event_stat', 'event_id') &&
		GlideTableDescriptor.fieldExists('ua_event_stat', 'time_stamp') &&
		GlideTableDescriptor.fieldExists('ua_event_stat', 'event_count');
}
