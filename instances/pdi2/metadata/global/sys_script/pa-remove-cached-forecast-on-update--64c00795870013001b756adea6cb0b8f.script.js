(function executeRule(current, previous /*null when async*/) {
	var forecastingConfigChanged = current.forecast_method != previous.forecast_method || current.forecast_periods != previous.forecast_periods || current.forecast_base_periods != previous.forecast_base_periods || current.forecast_base_start != previous.forecast_base_start;

	if(forecastingConfigChanged){
		var forecastCleaner = new SNC.PACachedForecastCleaner();
		forecastCleaner.processCachedForecastDelete(current.getValue('sys_id'));
	}


})(current, previous);
