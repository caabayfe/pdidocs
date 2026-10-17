var ChangeTemplateMetricsSNC = Class.create();
ChangeTemplateMetricsSNC.prototype = {
    LOG_PROPERTY: "com.snc.itsm.state_transition_model.log",

    initialize: function(chgModelTemplateMetricGr, _gs) {
        this._gr = chgModelTemplateMetricGr;
        this._gs = _gs || gs;
        this._log = new GSLog(this.LOG_PROPERTY, this.type).setLog4J();
    },

    setGr: function(chgTemplateMetricGr) {
        this._gr = chgTemplateMetricGr;
    },

    refreshMetrics: function() {
        var metrics = this.getMetrics();
        this.updateMetrics(metrics);
    },

    getMetrics: function() {
        var total = this._getChgTemplateMetric();
        var totalUnsuccessful = this._getChgTemplateMetric("unsuccessful");
        var percentSuccess = (total === 0) ? "" : ((total - totalUnsuccessful) * 100.0) / total;

        if (this._log.atLevel(GSLog.DEBUG)) {
            this._log.debug("[getMetrics] total changes: " + total);
            this._log.debug("[getMetrics] total unsuccessful changes: " + totalUnsuccessful);
            this._log.debug("[getMetrics] percent Success: " + percentSuccess);
        }

        var statistics = {
            total,
            totalUnsuccessful,
            percentSuccess
        };
        return statistics;
    },

    refreshAllChangeTemplateMetrics: function() {
        var chgTemplateMetricGr = this._getChgTemplateMetricGrs();
        while (chgTemplateMetricGr.next()) {
            if (this._log.atLevel(GSLog.DEBUG))
                this._log.debug("[refreshAllChangeTemplateMetrics] refreshing: " + chgTemplateMetricGr.getDisplayValue("change_template"));
            this.setGr(chgTemplateMetricGr);
            this.updateMetrics(this.getMetrics());
        }
    },

    updateMetrics: function(metrics) {
        this._gr.setValue("closed_change_count", metrics.total);
        this._gr.setValue("unsuccessful_change_count", metrics.totalUnsuccessful);
        this._gr.setValue("percent_successful", metrics.percentSuccess);
        this._gr.update();
    },

    _getChgTemplateMetric: function(closeCodeValue /* optional */ ) {
        var chgTemplateSysId = this._gr.getValue("chg_template");
        if (this._log.atLevel(GSLog.DEBUG))
            this._log.debug("[_getChgTemplateMetric] chgTemplateSysId: " + chgTemplateSysId + " - closeCodeValue: " + closeCodeValue);

        var totalCount = 0;
        var ga = new GlideAggregate("change_request");
        ga.addAggregate("COUNT");
        ga.addQuery("chg_model_template", chgTemplateSysId);
        ga.addNotNullQuery("close_code");
        if (closeCodeValue)
            ga.addQuery("close_code", closeCodeValue);
        ga.query();
        if (ga.next())
            totalCount = ga.getAggregate("COUNT");
        return totalCount * 1;
    },

    _getChgTemplateMetricGrs: function() {
        var chgTemplateMetricGr = new GlideRecordSecure("chg_template_metric");
        chgTemplateMetricGr.query();
        return chgTemplateMetricGr;
    },

    type: "ChangeTemplateMetricsSNC"
};
