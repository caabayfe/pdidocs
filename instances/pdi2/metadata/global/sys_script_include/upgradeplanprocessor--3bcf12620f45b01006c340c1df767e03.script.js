var UpgradePlanProcessor = Class.create();
UpgradePlanProcessor.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    buildUpgradePlan: function() {
        try {
            var progressId = new sn_utc.UpgradePlanAPI().createUpgradePlan();

            return JSON.stringify({
                progressId: progressId
            });
        } catch (e) {
            return JSON.stringify({
                errorMessage: e.message
            });
        }
    },

    refreshUpgradePlan: function( /*String*/ releaseTarget) {
        try {
            var sysProperties = new GlideRecord('sys_properties');
            sysProperties.addQuery('name', 'glide.war');
            sysProperties.query();
            sysProperties.next();
            var progressId = new sn_utc.UpgradePlanAPI().refreshUpgradePlan(sysProperties.getValue('value'));

            return JSON.stringify({
                progressId: progressId
            });
        } catch (e) {
            return JSON.stringify({
                errorMessage: e.message
            });
        }
    },

    publishUpgradePlan: function() {
        try {
            var progressId = new sn_utc.UpgradePlanAPI().publishUpgradePlan(this.getParameter("sysparm_sysId"));

            return JSON.stringify({
                progressId: progressId
            });
        } catch (e) {
            return JSON.stringify({
                errorMessage: e.message
            });
        }
    },

    canPublishUpgradePlan: function() {
        try {
            var canPublish = new sn_utc.UpgradePlanAPI().canPublishUpgradePlan(this.getParameter("sysparm_sysId"));

            return JSON.stringify({
                canPublish: canPublish
            });
        } catch (e) {
            return JSON.stringify({
                errorMessage: e.message
            });
        }
    },

    reprocessUpgradePlan: function() {
        try {
            var progressId = new sn_utc.UpgradePlanAPI().reprocessUpgradePlan(this.getParameter("sysparm_sysId"));

            return JSON.stringify({
                progressId: progressId
            });
        } catch (e) {
            return JSON.stringify({
                errorMessage: e.message
            });
        }
    },

	installUpgradePlan: function() {
        try {
            var progressId = new sn_utc.UpgradePlanAPI().installUpgradePlan(this.getParameter("sysparm_sysId"));

            return JSON.stringify({
                progressId: progressId
            });
        } catch (e) {
            return JSON.stringify({
                errorMessage: e.message
            });
        }
    },

    exportUpgradePlan: function() {
		try {
			var attachment = new sn_utc.UpgradePlanAPI().exportUpgradePlan(this.getParameter("sysparm_sysId"), this.getParameter("sysparm_planName"), this.getParameter("sysparm_targetVersion"));
			return attachment;
		} catch (e) {
			return JSON.stringify({
                errorMessage: e.message
            });
		}
	},

	deleteUpgradePlanAttachment: function() {
		try {
			var gr = new GlideRecord('sys_attachment');
			gr.addQuery('sys_id', this.getParameter("sysparm_sysId"));
			gr.query();
			var status;
			if (gr.next()) {
				status = gr.deleteRecord();
			}
			return JSON.stringify({
                status: status
            });
		} catch (e) {
			return JSON.stringify({
                errorMessage: e.message
            });
		}
	},

    type: 'UpgradePlanProcessor'
});
