var questions = new GlideRecord('asmt_metric');
questions.addEncodedQuery('metric_type.evaluation_method=assessment^depends_onISNOTEMPTY');
questions.query();
var count = 1;
var maxLevel = 0;

var dependentMetric = {};

while (questions.next()) {
    dependentMetric[questions.sys_id] = questions.getValue('depends_on');
}

var tempListMetric = [];
var depthOfMetric = {};

function calculateDepth(metric) {
    if (metric in depthOfMetric) {
        count = depthOfMetric[metric] + count;
        return;
    } else {
        if (metric in dependentMetric) {
            count++;
            tempListMetric.push(metric);
            calculateDepth(dependentMetric[metric]);
        }
    }

}

function addDepthForEachMetric() {
    for (var i = 0; i < tempListMetric.length; i++) {
        depthOfMetric[tempListMetric[i]] = count - i;
    }
}

for (var metric in dependentMetric) {
    if (metric in depthOfMetric) {
        count = depthOfMetric[metric];
    } else {
        tempListMetric.push(metric);
        calculateDepth(dependentMetric[metric]);
    }
    if (tempListMetric.length > 0) {
        addDepthForEachMetric();
    }

    if (count > maxLevel) {
        maxLevel = count;
    }
    count = 1;
    tempListMetric = [];
}
answer = maxLevel;
