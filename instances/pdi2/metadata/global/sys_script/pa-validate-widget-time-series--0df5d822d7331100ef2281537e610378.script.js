if (current.indicator && !SNC.PAIndicator.validAggregate(current.aggregate, current.indicator.sys_id)) {
    gs.addErrorMessage(gs.getMessage("The time series aggregation that you selected is not available for this indicator. Check the indicator record to see whether this time series is excluded."));
	current.setAbortAction(true);
}
