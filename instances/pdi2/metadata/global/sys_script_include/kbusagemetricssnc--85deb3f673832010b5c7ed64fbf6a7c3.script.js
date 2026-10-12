var KBUsageMetricsSNC = Class.create();
KBUsageMetricsSNC.prototype = {

    initialize: function() {
        this.PROP_KB_USAGE_METRICS_DURATION = "glide.knowman.usage_metrics_duration";
        this.kbUsageMetricsDuration = gs.getProperty(this.PROP_KB_USAGE_METRICS_DURATION, '60');
        this.guestUser = "5136503cc611227c0183e96598c4f706"; //sys_id of guest user
        this.TABLE_KB_USAGE_METRICS = "kb_usage_metrics";
		this.AUTHENTICATED_USER = "Authenticated";
		this.UNAUTHENTICATED_USER = "Unauthenticated";
    },

    _getEncodedQuery: function() {
        var timePeriod = "sys_created_on>" + this.startTime.getValue();
        return timePeriod;
    },

    processKBUsageMetrics: function() {
        this.startTime = new GlideDateTime();
        this.endTime = new GlideDateTime();
        this.startTime.addSeconds(parseInt(this.kbUsageMetricsDuration) * -60);
        this._processUsageMetrics(false);
		this._processUsageMetrics(true);
    },

    _processUsageMetrics: function(isAuthenticatedUser) {
        var portalPagesViews = 0,
            articleViews = 0,
            knowledgeSearchQueries = 0,
            timePeriod = this._getEncodedQuery();

        if (gs.nil(timePeriod))
            return;

        try {
            //Number of Portal Page Views
            var portalGA = new GlideAggregate("sp_log");

			if(isAuthenticatedUser)
				portalGA.addEncodedQuery(timePeriod + "^type=Page View^user!=" + this.guestUser);
			else	
				portalGA.addEncodedQuery(timePeriod + "^type=Page View^user=" + this.guestUser);

			portalGA.addAggregate('COUNT');
			portalGA.setWorkflow(false);
            portalGA.query();

            if (portalGA.next()) {
                portalPagesViews = portalGA.getAggregate('COUNT');
                gs.info("Number of Portal Page hits: " + portalPagesViews);
            }

            //Number of Article Views
            var knowledgeViewGA = new GlideAggregate("kb_use");

			if(isAuthenticatedUser)
				knowledgeViewGA.addEncodedQuery(timePeriod + "^user!=" + this.guestUser);
			else
				knowledgeViewGA.addEncodedQuery(timePeriod + "^user=" + this.guestUser);

			knowledgeViewGA.addAggregate('COUNT');
			knowledgeViewGA.setWorkflow(false);
            knowledgeViewGA.query();

            if (knowledgeViewGA.next()) {
                articleViews = knowledgeViewGA.getAggregate('COUNT');
                gs.info("Number of Article views: " + articleViews);
            }

            //Number of Article Searches
            var knowledgeSearchGA = new GlideAggregate("ts_query_kb");

			if(isAuthenticatedUser)
				knowledgeSearchGA.addEncodedQuery(timePeriod + "^user!=" + this.guestUser);
            else
				knowledgeSearchGA.addEncodedQuery(timePeriod + "^user=" + this.guestUser);

            knowledgeSearchGA.addAggregate('COUNT');
            knowledgeSearchGA.setWorkflow(false);
            knowledgeSearchGA.query();

            if (knowledgeSearchGA.next()) {
                knowledgeSearchQueries = knowledgeSearchGA.getAggregate('COUNT');
                gs.info("Number of Portal searches: " + knowledgeSearchQueries);
            }

			if(isAuthenticatedUser)
				this._saveKBUsageMetrics(portalPagesViews, articleViews, knowledgeSearchQueries, this.AUTHENTICATED_USER);
			else
				this._saveKBUsageMetrics(portalPagesViews, articleViews, knowledgeSearchQueries, this.UNAUTHENTICATED_USER);

        } catch (err) {
            gs.error("Error in aggregating knowledgee usage metrics - " + err.message);
        }

    },

    _saveKBUsageMetrics: function(portalPagesViews, articleViews, knowledgeSearchQueries, userType) {
        try {
            var gr = new GlideRecord(this.TABLE_KB_USAGE_METRICS);
            gr.initialize();
            gr.setValue("portal_page_views", portalPagesViews);
            gr.setValue("article_views", articleViews);
            gr.setValue("knowledge_searches", knowledgeSearchQueries);
            gr.setValue("duration", GlideDateTime.subtract(this.startTime, this.endTime).getDurationValue());
            gr.setValue("start_time", this.startTime);
            gr.setValue("end_time", this.endTime);
			gr.setValue("user_type", userType);
            gr.insert();
        } catch (err) {
            gs.error("Error in saving portal related aggregated metrics " + err.message);
        }
    },

    type: 'KBUsageMetricsSNC'
};
