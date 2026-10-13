var helper = new ApplyBoundsSettingsHelper(); 
var filters = helper.getFiltersForLearner(event);

SNC.MetricScriptableApis.learnMetricsStaticBoundsConfigRules(event.parm1.getValue(), filters);
