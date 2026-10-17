var CMDBWsHealthDashboardLegacyUtil = Class.create();
CMDBWsHealthDashboardLegacyUtil.prototype = {
    initialize: function() {
        this.weights = this._getWeights();
        this.LEGACY_SCORE_PROPERTY = 'sn_cmdb_ws.glide.cmdb.health.legacy_scoring';
    },
    weights: null,
    getLegacyScore: function(metricScore) {
        var weightedScore = 0;
        for (var i = 0; i < metricScore.length; i++) {
            var metric = metricScore[i];
            var weight = this.weights[metric.metric];
            if (metric.sub) {
                if (metric.total != 0)
                    weightedScore += ((metric.total - metric.failed) * weight) / metric.total;
                else
                    weightedScore += Number(weight);
            }
        }
        for (var i = 0; i < metricScore.length; i++) {
            if (!metricScore[i].sub) {
                metricScore[i].legacy_score = this._roundScore(weightedScore);
            } else {
                metricScore[i].legacy_score = metricScore[i].score;
            }
        }
        return metricScore;
    },

    getOverAllScore: function(completeness, correctness, compliance) {
        var weightedScore = 0;
        weightedScore = this._getParentMetricScore(completeness, weights) + this._getParentMetricScore(correctness, this.weights) + this._getParentMetricScore(compliance, this.weights);
        return weightedScore;
    },

    getWeights: function() {
        return this._getWeights();
    },

    legacyScoresAllowed: function() {
        var propertyVal = gs.getProperty(this.LEGACY_SCORE_PROPERTY, false);
        return propertyVal === 'true';
    },

    updateLegacyScoreProperty: function(newValue) {
        var workspaceUtil = new sn_cmdb_ws.CMDBWorkspaceUtil();
        workspaceUtil.updateSysProperty(this.LEGACY_SCORE_PROPERTY, newValue);
    },

    formatMetric: function(metric, score) {
		var hasNoResults = false;
		if (Number.isNaN(score)) {
			hasNoResults = true;
		}
        var result = {
            metric: metric.metric,
            friendly_name: metric.friendly_name,
            status: metric.status,
            score: score,
            default_score_label: sn_i18n.Message.getMessage("sn_cmdb_ws","N/A"),
            updated: metric.updated,
            metric_aria_label: sn_i18n.Message.getMessage("sn_cmdb_ws","CMDB Health {0} {1}", {0: metric.friendly_name, 1: score}),
            last_update_label: sn_i18n.Message.getMessage("sn_cmdb_ws","Last update: {0}", {0: metric.updated}),
			has_no_results: hasNoResults
        };
        return result;
    },

    _getParentMetricScore: function(metricScore, weights) {
        var weightedScore = 0;
        for (var i = 0; i < metricScore.length; i++) {
            if (!metricScore[i].sub) {
                weightedScore += (this.weights[metricScore[i].friendly_name] * metricScore[i].legacy_score) / 100.0;
            }
        }
        return this._roundScore(weightedScore);
    },

    _getWeights: function() {
        var names = {};
        var metricNames = new GlideRecord('cmdb_health_metric');
        metricNames.query();
        while (metricNames.next()) {
            let metric = metricNames.getValue('name').toUpperCase();
            names[metricNames.getValue('sys_id')] = metric;
        }
        var weightedContributions = {};
        var gr = new GlideRecord('cmdb_health_metric_pref');
        gr.query();
        //TODO: check domian speration 
        while (gr.next()) {
            weightedContributions[names[gr.getValue('metric')]] = gs.nil(gr.getValue('weighted_average_contribution')) ? 0 : gr.getValue('weighted_average_contribution');
        }
        return weightedContributions;
    },

    _roundScore: function(weightedScore) {
        if (weightedScore > 99 && weightedScore < 100)
            weightedScore = 99;
        else if (weightedScore > 0 && weightedScore < 1)
            weightedScore = 1;
        else
            weightedScore = Math.round(weightedScore);
        return weightedScore;
    },

    getTranslatedLabels: function() {
        return {
            MISSING_REQUIRED_ATTRIBUTES: sn_i18n.Message.getMessage("sn_cmdb_ws", "Missing required attributes"),
            CIS_MISSING_REQUIRED_ATTRIBUTES: sn_i18n.Message.getMessage("sn_cmdb_ws"," CIs missing required attributes"),
            MISSING_RECOMMENDED_ATTRIBUTES: sn_i18n.Message.getMessage("sn_cmdb_ws","Missing recommended attributes"),
            CIS_MISSING_RECOMMENDED_ATTRIBUTES: sn_i18n.Message.getMessage("sn_cmdb_ws"," CIs missing recommended attributes"),
            DUPLICATE_CIS: sn_i18n.Message.getMessage("sn_cmdb_ws","Duplicate CIs"),
            CIS_THAT_ARE_DUPLICATES: sn_i18n.Message.getMessage("sn_cmdb_ws"," CIs that are duplicates"),
            ORPHAN_CIS: sn_i18n.Message.getMessage("sn_cmdb_ws","Orphan CIs"),
            CIS_THAT_ARE_ORPHANS: sn_i18n.Message.getMessage("sn_cmdb_ws"," CIs that are orphans"),
            STALE_CIS: sn_i18n.Message.getMessage("sn_cmdb_ws","Stale CIs"),
            CIS_THAT_ARE_STALE: sn_i18n.Message.getMessage("sn_cmdb_ws"," CIs that are stale"),
            AUDIT: sn_i18n.Message.getMessage("sn_cmdb_ws","Audit"),
            CIS_NOT_COMPLIANT_WITH_AUDIT: sn_i18n.Message.getMessage("sn_cmdb_ws"," CIs that are not compliant with Audit"),
            GOOD_MORNING: sn_i18n.Message.getMessage("sn_cmdb_ws","Good morning"),
            GOOD_EVENING: sn_i18n.Message.getMessage("sn_cmdb_ws","Good evening"),
            GOOD_AFTERNOON: sn_i18n.Message.getMessage("sn_cmdb_ws","Good afternoon"),
            CLASS: sn_i18n.Message.getMessage("sn_cmdb_ws","Class"),
            SERVICE: sn_i18n.Message.getMessage("sn_cmdb_ws","Service"),
            HEALTH_GROUP: sn_i18n.Message.getMessage("sn_cmdb_ws","Health Group"),
            NA: sn_i18n.Message.getMessage("sn_cmdb_ws","N/A"),
            FAILED_CIS_EVALUATED_CIS: sn_i18n.Message.getMessage("sn_cmdb_ws","Failed CIs / Evaluated CIs"),
            HEALTHY_CIS_EVALUATED_CIS: sn_i18n.Message.getMessage("sn_cmdb_ws","Healthy CIs / Evaluated CIs"),
            CIS_WITH_REQUIRED_ATTRIBUTES: sn_i18n.Message.getMessage("sn_cmdb_ws","CIs with required attributes"),
            CIS_WITH_RECOMMENDED_ATTRIBUTES: sn_i18n.Message.getMessage("sn_cmdb_ws","CIs with recommended attributes"),
            NON_DUPLICATE_CIS: sn_i18n.Message.getMessage("sn_cmdb_ws","Non-Duplicate CIs"),
            NON_ORPHAN_CIS: sn_i18n.Message.getMessage("sn_cmdb_ws","Non-Orphan CIs"),
            NON_STALE_CIS: sn_i18n.Message.getMessage("sn_cmdb_ws","Non-Stale CIs"),
            NON_COMPLIANT_CIS: sn_i18n.Message.getMessage("sn_cmdb_ws","Non-Compliant CIs"),
            COMPLIANT_CIS: sn_i18n.Message.getMessage("sn_cmdb_ws","Compliant CIs"),
            THIS_KPI_HAS_NOT_RUN: sn_i18n.Message.getMessage("sn_cmdb_ws",'This KPI has not run'),
            ONE_OR_MORE_JOBS_FAILED: sn_i18n.Message.getMessage("sn_cmdb_ws",'One or more jobs failed'),
            SELECT_ICON_FOR_DETAILS: sn_i18n.Message.getMessage("sn_cmdb_ws","Select the 'i' icon for more details"),
            NO_DATA_AVAILABLE: sn_i18n.Message.getMessage("sn_cmdb_ws",'No data available'),
            JOB_COMPLETED_NO_CIS: sn_i18n.Message.getMessage("sn_cmdb_ws",'Job completed, however, there were no CIs available to evaluate.'),
			COMPLETE: sn_i18n.Message.getMessage("sn_cmdb_ws","Complete"),
			INCOMPLETE: sn_i18n.Message.getMessage("sn_cmdb_ws","Incomplete"),
			CIS_EVALUATED: sn_i18n.Message.getMessage("sn_cmdb_ws","CIs evaluated"),
			MAX_FAILURES_MESSAGE: sn_i18n.Message.getMessage("sn_cmdb_ws","Failure threshold has been reached. Select the 'i' icon to view which metrics failed."),
			INCOMPLETE_MESSAGE: sn_i18n.Message.getMessage("sn_cmdb_ws", "Select the 'i' icon to view which metrics failed, and check the system log for more information."),
			DAILY_TIMEOUT_MESSAGE: sn_i18n.Message.getMessage("sn_cmdb_ws", "Health Dashboard job timed out. Wait for the next cycle to see health results (depending on CMDB size, might take a day or more). Select the 'i' icon to see which metrics timed out."),
			TOP_TEN: sn_i18n.Message.getMessage("sn_cmdb_ws", "Top 10"),
			WHAT_WOULD_YOU_LIKE_TO_REVIEW: sn_i18n.Message.getMessage("sn_cmdb_ws", "what would you like to review")
        };
    },

    type: 'CMDBWsHealthDashboardLegacyUtil'
};
