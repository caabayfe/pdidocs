(function executeRule(current, previous /*null when async*/) {
	var rateSysId = current.conversion_rate + '';
	if (JSUtil.nil(rateSysId))
		return;

	var refRecord = current.conversion_rate.getRefRecord();

	var rateFromCurrency = refRecord.from_currency + '';
	var rateToCurrency = refRecord.to_currency + '';
	if (current.currency != rateFromCurrency) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('From currency {0} in rate record does not match entered currency {1}', [rateFromCurrency, current.currency]));
	} else if (current.reference_currency != rateToCurrency) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('To currency {0} in rate record does not match reference currency {1}', [rateToCurrency, current.reference_currency]));
	}
})(current, previous);
