function script({ api, event, helpers, imports }) {
	const { getDefaultStartDate, getDefaultEndDate, getDefaultTimelineStartBounds, 
		getDefaultTimelineEndBounds, getCustomDateMonthsInPast, getCustomDateMonthsInFuture,
		getCustomDateDaysInPast, getCustomDateDaysInFuture, getNowTimestamp } = imports["sn_cmdb_ws.unifiedMapTimelineUtil"]();

	// set timeline date boundaries
	api.setState('timelineStartDateTime', getCustomDateDaysInPast(api.context.props.displayDaysInPast) || getDefaultStartDate());
	api.setState('timelineEndDateTime', getCustomDateDaysInFuture(api.context.props.displayDaysInFuture) || getDefaultEndDate());
	api.setState('timelineStartDateBounds', getCustomDateMonthsInPast(api.context.props.maxMonthsInPast) || getDefaultTimelineStartBounds());
	api.setState('timelineEndDateBounds', getCustomDateMonthsInFuture(api.context.props.maxMonthsInFuture) || getDefaultTimelineEndBounds());
    
	// set marker config
	const markersConfig = {
		icon: 'mapPinFill',
		color: '#4f52bd',
		markerType: 'single',
		markerTimestamps: [{
			timestamp: getNowTimestamp() 
		}],
		datePickerConfiguration: {datePickerFormat: 'yyyy/MM/dd HH:mm:ss'}
	}

	//Prevents overwriting the timeline toggle button state for showTimeline after first load
	if(api.state.isFirstLoad){
		api.setState('showTimeline', true);
		api.setState('isFirstLoad', false);
	}
	api.setState('defaultMarkerConfig', markersConfig);
}
