var MIScore = Class.create();
MIScore.prototype = {
    DAYS_AGO_END: 1,
    BASIC_AUTH_WINDOW: 30,
    UI_LOGIN_AND_INTEGRATION_WINDOW: 30,
    TOTAL_SCORE_IMPACT: 100,
    DORMANCY_WINDOW: 100,

    initialize: function() {},

    updateScore: function() {
        var categoryConf = this.loadRiskCategories();
        this.updateDormantScore(categoryConf.dormant);
        this.updateBasicAuthScore(categoryConf.basic_auth);
        this.updateWsaFalseScore(categoryConf.wsa_false);
        this.updateUILoginAndIntegrationScore(categoryConf.ui_login_and_integration);
    },

    loadRiskCategories: function(excludeInactive) {

        var scoreFactor = this.getScoreFactor();

        var categoryConf = {};
        var riskCategoryRecord = new GlideRecord('sys_mi_risk_category');
        if (excludeInactive === true) {
            riskCategoryRecord.addQuery('active', true);
        }
        riskCategoryRecord.query();
        while (riskCategoryRecord.next()) {
            var active = riskCategoryRecord.getValue("active") === "1";
            categoryConf[riskCategoryRecord.getValue("name")] = {
                sysId: riskCategoryRecord.getValue("sys_id"),
                active: active,
                scoreImpact: active ? scoreFactor.scoreImpact : 0
            };
        }

        // including margin impact left to ui_login_and_integration category
        categoryConf.ui_login_and_integration.scoreImpact = scoreFactor.scoreImpact + scoreFactor.margin

        return categoryConf;
    },

    updateDormantScore: function(conf) {
        var ga = new GlideAggregate("sys_user");
        ga.addQuery("web_service_access_only", true);
        ga.addQuery("active", true);
        var total = this.getAggregateResult(ga);

        ga = new GlideAggregate("sys_mi_user_tracker");
        this.addQueryForLastNDays(ga, this.DORMANCY_WINDOW);
        ga.addQuery("user.web_service_access_only", true);
        ga.addQuery("user.active", true);
        var nonRisky = this.getAggregateResult(ga);
        var risky = total - nonRisky;
        this.addScore(conf.sysId, total, risky, conf.scoreImpact);
    },

    updateBasicAuthScore: function(conf) {
        var ga = new GlideAggregate("sys_mi_request");
        this.addQueryForLastNDays(ga, this.BASIC_AUTH_WINDOW);
        var total = this.getAggregateResult(ga);

        ga = new GlideAggregate("sys_mi_request");
        this.addQueryForLastNDays(ga, this.BASIC_AUTH_WINDOW);
        ga.addQuery("auth", "basic_auth");
        var risky = this.getAggregateResult(ga);

        this.addScore(conf.sysId, total, risky, conf.scoreImpact);
    },

    updateWsaFalseScore: function(conf) {
        var ga = new GlideAggregate("sys_mi_user_tracker");
        ga.addQuery("user.active", true);
        var total = this.getAggregateResult(ga);

        ga = new GlideAggregate("sys_mi_user_tracker");
        var condition = ga.addQuery("user.web_service_access_only", false);
        condition.addOrCondition("user.web_service_access_only", null);
        ga.addQuery("user.active", true);
        var risky = this.getAggregateResult(ga);

        this.addScore(conf.sysId, total, risky, conf.scoreImpact);
    },

    updateUILoginAndIntegrationScore: function(conf) {
        var ga = new GlideAggregate("sys_mi_user_tracker");
        this.addQueryForLastNDays(ga, this.UI_LOGIN_AND_INTEGRATION_WINDOW);
        var total = this.getAggregateResult(ga);

        ga = new GlideAggregate("sys_mi_user_tracker");
        this.addQueryForLastNDays(ga, this.UI_LOGIN_AND_INTEGRATION_WINDOW);
        ga.addQuery("user.last_login", ">=", gs.daysAgoStart(this.UI_LOGIN_AND_INTEGRATION_WINDOW));
        ga.addQuery("user.last_login", "<=", gs.daysAgoEnd(this.DAYS_AGO_END));
        var risky = this.getAggregateResult(ga);

        this.addScore(conf.sysId, total, risky, conf.scoreImpact);
    },

    addQueryForLastNDays: function(glideRecord, n) {
        glideRecord.addQuery("last_used", ">=", gs.daysAgoStart(n));
        glideRecord.addQuery("last_used", "<=", gs.daysAgoEnd(this.DAYS_AGO_END));
    },

    getAggregateResult: function(glideAggregate) {
        glideAggregate.addAggregate("COUNT");
        glideAggregate.query();
        glideAggregate.next();
        return parseInt(glideAggregate.getAggregate("COUNT"));
    },

    addScore: function(riskCategorySysId, total, risky, scoreImpact) {
        var gr = new GlideRecord('sys_mi_risk_compliance_score');
        gr.addQuery("risk_category", riskCategorySysId);
        gr.query();
        if (!gr.next())
            gr.initialize();

        gr.risk_category = riskCategorySysId;
        gr.total_mi = total;
        gr.risky_mi = risky;
        gr.score = this.getScore(total, risky, scoreImpact);
        gr.score_impact = scoreImpact;
        gr.update();
    },

    activateCategory: function(category, active) {
        var gr = new GlideRecord('sys_mi_risk_category');
        gr.addQuery('name', category);
        gr.query();
        gr.next();
        gr.active = active;
        gr.update();
        new global.MIUtil().updatePageProperty("dormant_category_enabled", active);
        this.adjustScore();
    },

    getScore: function(total, risky, scoreImpact) {
        return total == 0 ? scoreImpact : parseFloat(((total - risky) / total * scoreImpact).toFixed(1));
    },

    adjustScore: function() {
        var categoryConf = this.loadRiskCategories();
        var gr = new GlideRecord('sys_mi_risk_compliance_score');
        gr.query();
        while (gr.next()) {
            var scoreImpact = categoryConf[gr.risk_category.name].scoreImpact;
            gr.score_impact = scoreImpact;
            gr.score = this.getScore(gr.total_mi, gr.risky_mi, scoreImpact);
            gr.update();
        }
    },

    getRiskComplianceScore: function() {

        var categoryMap = this.loadRiskCategories(true);
        var res = {};
        var name;
        for (name in categoryMap) {
            res[name] = this._emptyScoreObject();
            res[name].name = name;
            res[name].scoreImpact = categoryMap[name].scoreImpact;
        }

        var gr = new GlideRecord('sys_mi_risk_compliance_score');
        gr.addQuery('risk_category.active', true);
        gr.query();
        while (gr.next()) {
            name = gr.risk_category.name.getDisplayValue();
            Object.assign(res[name], this._createScoreObject(gr));
        }

        var sequence = [
            'dormant',
            'basic_auth',
            'wsa_false',
            'ui_login_and_integration'
        ];

        return sequence
            .filter(name => res[name])
            .map(name => res[name]);
    },


    getScoreDetailForCategory: function(category) {
        var res = {};
        var gr = new GlideRecord('sys_mi_risk_compliance_score');
        gr.addQuery('risk_category.active', true);
        gr.addQuery('risk_category.name', category);
        gr.query();
        var exist = gr.next();
        Object.assign(res, this._createScoreObject(exist ? gr : null));
        if (!exist) {
            var sf = this.getScoreFactor();
            res.scoreImpact = sf.scoreImpact;
        }
        return res;
    },

    getScoreFactor: function() {
        var ga = new GlideAggregate('sys_mi_risk_category');
        ga.addQuery('active', true);
        var activeCategoriesCount = this.getAggregateResult(ga);
        var scoreImpact = parseFloat((this.TOTAL_SCORE_IMPACT / activeCategoriesCount).toFixed(1));
        return {
            scoreImpact: scoreImpact,
            margin: this.TOTAL_SCORE_IMPACT - parseFloat(scoreImpact * activeCategoriesCount).toFixed(1)
        };
    },

    _emptyScoreObject: function() {
        return {
            scoreImpact: '0.0',
            score: '0.0',
            riskyMI: 0,
            lastUpdated: ''
        };
    },

    _createScoreObject: function(gr) {
        if (!gr) return this._emptyScoreObject();
        return {
            score: parseFloat(gr.getValue('score')).toFixed(1),
            scoreImpact: parseFloat(gr.getValue('score_impact')).toFixed(1),
            riskyMI: parseInt(gr.getValue('risky_mi')),
            lastUpdated: gr.getDisplayValue('sys_updated_on')
        };
    },

    type: 'MIScore'

};
