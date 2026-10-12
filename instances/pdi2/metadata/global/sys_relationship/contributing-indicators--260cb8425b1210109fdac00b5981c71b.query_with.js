(function refineQuery(current, parent) {

	var FORMULA_INDICATOR = "2";

	function isNonFormulaIndicator(indicator) {
		return indicator.type.toString() !== FORMULA_INDICATOR;
	}

	var visited = {};

	//recursively find all contributing indicators of all the formula indicators that this builds on
	function getContributingIndicators(indicator, isRootIndicator) {

		isRootIndicator = !!isRootIndicator; //truthify the argument

		var contributingIndicators = [];

		//don't add the argument indicator if this is top level indicators we are finding the breakdown for
		if (isRootIndicator !== true)
			contributingIndicators.push(indicator.sys_id.toString());

		if (isNonFormulaIndicator(indicator))
			return contributingIndicators;

		//ensure we don't recurse into a cyclic definition
		var sysId = indicator.sys_id.toString();
		if (typeof visited[sysId] !== "undefined")
			return;

		visited[sysId] = 1;

		var contributingIndicatorsTmp = SNC.PAFormula.getIndicators(indicator.formula.toString());
		contributingIndicatorsTmp = contributingIndicatorsTmp.split(",");

		var currentIndicatorRecord = new GlideRecord("pa_indicators");
		currentIndicatorRecord.setWorkflow(false);
		currentIndicatorRecord.addQuery("sys_id", contributingIndicatorsTmp);
		currentIndicatorRecord.query();

		while (currentIndicatorRecord.next()) {
			//get all contributing indicators of this indicator
			var contributingIndicatorsSysIdCurrentIndicator = getContributingIndicators(currentIndicatorRecord);
			contributingIndicators = contributingIndicators.concat(contributingIndicatorsSysIdCurrentIndicator);
		}

		return contributingIndicators;
	}

	var contributingIndicators = getContributingIndicators(parent, true);
	current.addQuery("sys_id", contributingIndicators);

})(current, parent);
