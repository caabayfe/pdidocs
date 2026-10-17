var METRIC_NAME_TOKEN = "_";
var CACHE = "cache";
var AVAILABLE = "available";
var FREE = "free";
var BUFFER = "buffer";
var IDLE = "idle";

var USED = "used";
var UTILIZ = "utiliz";
var MISS = "miss";

var LOAD = "load";
var AVG = "avg";

var PERCENT = "percent";
var PCT = "pct";
var SEC = "sec";

var STEAL = "steal";
var NICE = "nice";
var IOWAIT = "iowait";
var SOFTIRQ = "softirq";
var IRQ = "irq";

var HIGHER_IS_BETTER_KEY = "higher_is_better";
var MAX_UB_KEY = "max_ub";
var MIN_LB_KEY = "min_lb";
var DETECTED_CONSTANT_CANDIDATE_KEY = "detected_constant_candidate";
var addDetectedConstantCandidate = false;

var NONE = 'none';

var MetricNameAnalysisUtil = Class.create();
MetricNameAnalysisUtil.prototype = {
    initialize: function() {
        addDetectedConstantCandidate = this.isAddDetectedConstantCandidate();
    },

    // analyze metric name while detectedConstantCandidate is no initialized
    analyzeMetricName: function(metricName) {
        return this.analyzeStringifyMetricName(metricName, "");
    },

    // analyze metric name while detectedConstantCandidate might be initialized
    analyzeStringifyMetricName: function(metricName, detectedConstantCandidate) {
        var result = this.analyzeJsonMetricName(metricName, detectedConstantCandidate);
        return JSON.stringify(result);
    },

    analyzeJsonMetricName: function(metricName, detectedConstantCandidate) {
        var higherIsBetter = false;
        var minLb = NONE;
        var maxUb = NONE;

        var metricNameArray = splitMetrticName(metricName);

        // If either of the tokens contain one of the following sub-strings: [‘cache’, ‘available’, ‘free’, ‘buffer’, ‘idle’] and does not contain the substring [‘used’, ‘utiliz’, 'miss'],
        // then higher_is_better_ind=1, min_lb=0
        // else higher_is_better_ind=0
        if (isContains(metricNameArray, [CACHE, AVAILABLE, FREE, BUFFER, IDLE])) {
            if (!isContains(metricNameArray, [USED, UTILIZ, MISS])) {
                higherIsBetter = true;
                minLb = '0.0';
            }
        }

        // If either of the tokens contain one of the following sub-strings: [‘load’, ‘avg'] and does not contain the substring [‘sec’], then max_ub=1, min_lb=0
        if (isContains(metricNameArray, [LOAD, AVG]) && !isContains(metricNameArray, [SEC])) {
            minLb = '0.0';
            maxUb = '1.0';
        }

        // If either of the tokens contain one of the following sub-strings: [‘percent’, 'pct'] then
        if (isContains(metricNameArray, [PERCENT, PCT])) {
            // min_lb=0
            minLb = '0.0';
            // If tokens do not contain the substring [‘steal’, ‘nice’, 'iowait', 'softirq', 'irq'], then max_ub=100
            if (!isContains(metricNameArray, [STEAL, NICE, IOWAIT, SOFTIRQ, IRQ])) {
                maxUb = '100.0';
                // If tokens contain one of the substrings the substring [‘steal’, ‘nice’, ‘irq’, ‘softirq’], then max_ub=50
            } else if (isContains(metricNameArray, [STEAL, NICE, SOFTIRQ, IRQ])) {
                maxUb = '50.0';
                //  If tokens contain the substring [‘iowait’], then max_ub=75
            } else if (isContains(metricNameArray, [IOWAIT])) {
                maxUb = '75.0';
            }
        }

        var result = {};

        result[HIGHER_IS_BETTER_KEY] = higherIsBetter.toString();

        if (minLb != NONE) {
            result[MIN_LB_KEY] = minLb;
        }

        if (maxUb != NONE) {
            result[MAX_UB_KEY] = maxUb;
        }

        //addDETECTED_CONSTANT_CANDIDATE_KEY
        if (addDetectedConstantCandidate) {
            var detectedConstantMetricUtil = new sn_metrics_ng.DetectedConstantMetricUtil();
            result[DETECTED_CONSTANT_CANDIDATE_KEY] =
                detectedConstantMetricUtil.isDetectedConstantCandidate(metricName, metricNameArray, detectedConstantCandidate);
        }

        return result;
    },

    // fix metric_name_analysis_result only while the field is null
    verifyAndFixNameAnalysis: function() {
        this.fixNameAnalysis(true);
    },

    // fix metric_name_analysis_result
    fixNameAnalysis: function(fillEmptyOnly) {
		gs.info('MetricNameAnalysisUtil.fixNameAnalysis starting with fillEmptyOnly=' + fillEmptyOnly);
        var gr = new GlideRecord('sa_metric_type');
        if (fillEmptyOnly) {
            gr.addNullQuery('metric_name_analysis_result');
        }

        gr.query();
        while (gr.next()) {
            var tinyName = gr.getValue('metric_type_tiny_name');
            if (JSUtil.nil(tinyName)) {
				gs.info('MetricNameAnalysisUtil.fixNameAnalysis: metric_name_analysis_result is not analyzed for metric ' + gr.getValue('metric_type') 
				+ ' because its tiny name is empty');
            } else {
                var result = this.analyzeMetricName(tinyName);
                if (JSUtil.notNil(result)) {
                    gr.setValue('metric_name_analysis_result', result);
                    gr.update();
                }
            }
        }
		gs.info('MetricNameAnalysisUtil.fixNameAnalysis ended');
    },

    isAddDetectedConstantCandidate: function() {
        // test id detected_constant_candidate flag should be added to name analysis result
        if (gs.getProperty('metric_name_analysis.add_detected_constant_candidate', 'false') == 'true') {
            var metricTypeCategoryGr = new GlideRecord('sa_metric_type_category');
            if (metricTypeCategoryGr.isValid()) {
                return true;
            }
        }
        return false;
    },

    type: 'MetricNameAnalysisUtil'
};

/*
	Function split the metric name according to delimeter.
	@param metric_name : 'weblogic_servlet_httpclntsend_time_high' 
	@return : ['weblogic', 'servlet', 'httpclntsend', 'time', 'high']
*/
function splitMetrticName(metricName) {
    return metricName.split(METRIC_NAME_TOKEN);
}

/*
	The functinon check if items of metricNameArray contains string (or sub-string) items of tokensArray.    
	@param metricNameArray: ['weblogic', 'servlet', 'httpclntsend', 'time', 'high']
	@param tokensArray    : ['cache', 'available', 'free', 'buffer'];    
*/
function isContains(metricNameArray, tokensArray) {
    if (metricNameArray.length == 0 || tokensArray.length == 0) {
        return false;
    }

    for (var i = 0; i < metricNameArray.length; i++) {
        var metricName = metricNameArray[i];
        for (var j = 0; j < tokensArray.length; j++) {
            var token = tokensArray[j];
            var index = metricName.indexOf(token);
            //token found in metric name;
            if (index !== -1) {
                return true;
            }
        }
    }
    return false;
}
