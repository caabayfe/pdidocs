var UXMetricsApplications = Class.create();
UXMetricsApplications.prototype = {
    initialize: function() {},

    deleteNowExpApp: function() {
        try {
            var analyticsRecord = new GlideRecord('sys_analytics_bucket');
            analyticsRecord.addQuery('bucket_table_name', 'sys_now_exp_app');
            analyticsRecord.addQuery('bucket_document_id', '635911e2732130107d804c9885f6a78f');
            analyticsRecord.query();
            while (analyticsRecord.next()) {
                analyticsRecord.deleteRecord();
            }
        } catch (error) {}
    },


    registerApp: function(req) {
        try {
            if (!sn_app_analytics.SNAnalytics.isApplicationRegistered(req.tableName, req.sysId)) {
                if (req.channel == 'web')
                    sn_app_analytics.SNAnalytics.registerWebApplication(req.tableName, req.sysId, req.appType);
                else if (req.channel == 'NextExperience') {
                    try {
                        sn_app_analytics.SNAnalytics.registerNextExperienceApplication(req.tableName, req.sysId, req.appType);
                        if (req.sysId == '635911e2732130107d804c9885f6a78f') {
                            this.deleteNowExpApp(); // delete legacy now app
                            gs.setProperty('sn_now_analytics.app_table', 'sys_ux_metrics_app');
                        }
                    } catch (err) {
                        if (req.sysId == '635911e2732130107d804c9885f6a78f') {
                            gs.error("Unable to register/delete the Next Exp application", err);
                            gs.setProperty('sn_now_analytics.app_table', 'sys_now_exp_app');
                        }
                    }
                } else if (req.channel == 'CoreUI')
                    sn_app_analytics.SNAnalytics.registerCoreUIApplication(req.tableName, req.sysId, req.appType);
            }
        } catch (err) {
            gs.error("Unable to register the ux-metrics application", err);
            return {
                error: err.message
            };
        }
    },

    registerAllApps: function() {
        var appsGr = new GlideRecord('sys_ux_metrics_app');
        appsGr.query();
        while (appsGr.next()) {
            this.registerApp({
                tableName: 'sys_ux_metrics_app',
                sysId: appsGr.sys_id,
                channel: appsGr.channel,
                appType: appsGr.app_type
            });
        }
    },

    type: 'UXMetricsApplications'
};
