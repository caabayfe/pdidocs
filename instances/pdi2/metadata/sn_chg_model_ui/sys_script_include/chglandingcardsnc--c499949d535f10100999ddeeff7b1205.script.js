var ChgLandingCardSNC = Class.create();
ChgLandingCardSNC.prototype = Object.extendsObject(ChgLandingBase, {
    initialize: function(_gr, _gs) {
        ChgLandingBase.prototype.initialize.call(this, _gr, _gs);

        var table = this._gr.getValue("sys_class_name");
        this.isPreapproved = table === "std_change_record_producer";
        this.isTemplate = table === "chg_template";
        this._typeCompatibility = gs.getProperty("com.snc.change_management.change_model.type_compatibility", false) === "true";
    },

    toJS: function(stateChoices) {
        var jsObj = this._toJS(this._gr);
        jsObj.success_rate = {};
        jsObj.success_rate_hint = {};
        jsObj.state_choices = stateChoices || this.getChgStates();
        jsObj.isPreapproved = this.isPreapproved;
        jsObj.isTemplate = this.isTemplate;

        var successRate = this._getChgSuccessRate(jsObj);

        this.addSuccessData(successRate, jsObj);

        if (this.isPreapproved) {
            jsObj.description = {
                value: jsObj.short_description.value,
                display_value: jsObj.short_description.display_value
            };

            jsObj.link = new global.StdChangeUtils().getActionURL(this._gr);
        } else if (this.isTemplate) {
            jsObj.description = jsObj.short_description;
            jsObj.link = "/" + jsObj.table.value + ".do?sys_id=-1&sysparm_query=chg_model_template=" + this._gr.getUniqueValue();
        } else
            jsObj.link = "/" + jsObj.table_name.value + ".do?sys_id=-1&sysparm_query=chg_model=" + jsObj.sys_id.value;

        var usePolaris = sn_ui.PolarisUI.isEnabled();
        if (usePolaris)
            jsObj.link = jsObj.link + "&sysparm_use_polaris=" + usePolaris;

        // Call TinyURL to shorten lengthy URLS
        jsObj.link = new global.ChangeUtils().getTinyURL(jsObj.link);
        return jsObj;
    },

    addSuccessData: function(successRate, jsObj) {
        if (successRate) {
            var percent = successRate.percent;
            if (typeof percent === "undefined" || percent === null || percent === "") {
                jsObj.success_rate.value = "-";
                jsObj.success_rate.display_value = gs.getMessage("Success rate: {0}", "-");
                jsObj.success_rate_hint.value = "-";
                jsObj.success_rate_hint.display_value = gs.getMessage("No success rate could be calculated");
            } else {
                jsObj.success_rate.value = percent;
                jsObj.success_rate.display_value = gs.getMessage("Success rate: {0}%", percent.toString());
                jsObj.success_rate_hint.value = percent;
                jsObj.success_rate_hint.display_value = gs.getMessage("Calculation based on recent change history");
            }
        }
    },

    getChgStates: function() {
        if (this.isPreapproved)
            return this._getStdChgStates();
        if (this.isTemplate) {
            var chgModelGr = new GlideRecordSecure(ChgLandingBase.CHG_MODEL);
            chgModelGr.get(this._gr.getValue("sttrm_model"));
            return new global.STTRMStateChoiceUtil(chgModelGr).getChoicesInfo(new global.ChangeModel(chgModelGr).getStates());
        }
        return new global.STTRMStateChoiceUtil(this._gr).getChoicesInfo(new global.ChangeModel(this._gr).getStates());
    },

    _getStdChgStates: function() {
        return this._typeCompatibility ? this._getStdChgStatesByType() : this._getStdChgStatesByModel();
    },

    _getStdChgStatesByType: function() {
        var stdChgStates = [];

        var choiceList = GlideChoiceList.getChoiceList("change_request", "state");
        for (var i = 0; i < choiceList.getSize(); i++) {
            var choice = choiceList.getChoice(i);
            // choice sequence not exposed by ScopedChoice using state value instead
            var state = {
                "value": choice.getValue(),
                "label": choice.getLabel(),
                "sequence": choice.getValue()
            };
            stdChgStates.push(state);
        }

        return stdChgStates;
    },

    _getStdChgStatesByModel: function() {
        var chgModelGr = new GlideRecordSecure("chg_model");
        if (chgModelGr.get("e55d0bfec343101035ae3f52c1d3ae49")) {
            var stdChgModel = new global.ChangeModel(chgModelGr);

            if (stdChgModel) {
                var stdChgStates = new global.STTRMStateChoiceUtil(chgModelGr).getChoicesInfo(stdChgModel.getStates());

                if (stdChgStates && stdChgStates.length > 0)
                    return stdChgStates;
            }
        }

        return this._getStdChgStatesByType();
    },

    _getChgSuccessRate: function(chgObj) {
        var successRateObj = {
            percent: null
        };

        if (!chgObj)
            return successRateObj;

        if (this.isPreapproved) {
            if (!chgObj.closed_change_count)
                return successRateObj;

            var closedChangeCount = parseInt(chgObj.closed_change_count.value || 0);
            if (!closedChangeCount)
                return successRateObj;

            var percentSuccessful = parseFloat(chgObj.percent_successful.value);
            if (isNaN(percentSuccessful))
                return successRateObj;

            successRateObj.percent = Math.round(percentSuccessful);

            return successRateObj;
        } else if (chgObj.isTemplate) {
            var chgTemplateMetricGr = new GlideRecordSecure("chg_template_metric");
            chgTemplateMetricGr.addQuery("chg_template", chgObj.sys_id.value);
            chgTemplateMetricGr.query();
            if (chgTemplateMetricGr.next()) {
                var metricValues = new global.ChangeTemplateMetrics(chgTemplateMetricGr).getMetrics();
                if (metricValues.total === 0)
                    return successRateObj;
                successRateObj.percent = Math.round(metricValues.percentSuccess);
            }
            return successRateObj;
        } else {
            if (GlidePluginManager.isActive("com.snc.change_management.change_success_score")) {
                var scoreData = new sn_chg_score.ChangeSuccess().getModelScoreForModelId(chgObj.sys_id.value);
                var hasScore = scoreData && scoreData.score && scoreData.score.value;

                if (hasScore)
                    successRateObj.percent = Math.round(scoreData.score.value);

                return successRateObj;
            } else
                return null;
        }
    },

    canDelete: function() {
        return this.canWrite();
    },

    canRead: function() {
        return this._gr.canRead();
    },

    canWrite: function() {
        return this._gr.isNewRecord();
    },

    type: "ChgLandingCardSNC"
});
