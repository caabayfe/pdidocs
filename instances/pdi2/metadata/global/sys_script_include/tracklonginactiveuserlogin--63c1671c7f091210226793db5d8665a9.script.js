var TrackLongInactiveUserLogin = Class.create();
TrackLongInactiveUserLogin.prototype = {
    initialize: function() {},

    trackUsers: function(current, previous) {
        if (gs.getProperty("glide.analytics.user_props.feature.enabled", true) == "false" || !this.isProductionInstance())
            return;

        var isUserActivated = previous.active == false && current.active == true;
        if (isUserActivated) {
            this.createUserLoginRecord(current);
            return;
        }

        if (previous.last_login_time.isNil()) {
            this.createUserLoginRecord(current);
            return;
        }

        var prevLoginGdt = new GlideDateTime(previous.last_login_time);
        var currLoginGdt = new GlideDateTime(current.last_login_time);
        var diffYears = (currLoginGdt.getNumericValue() - prevLoginGdt.getNumericValue()) / (1000 * 60 * 60 * 24 * 365);
        if (diffYears >= 2)
            this.createUserLoginRecord(current);
    },

    createUserLoginRecord: function(current) {
        var gr = new GlideRecord("sys_analytics_long_inactive_users_login_data");
        gr.user = current.sys_id.toString();
        gr.insertLazy();
    },

	isProductionInstance: function() {
        var instGR = new GlideRecord("ua_instance_state");
        instGR.query();
        if (instGR.next()) {
            var instanceUsedFor = instGR.getValue("instance_used_for");
            return instanceUsedFor ? instanceUsedFor.toLowerCase() === "production" : false;
        }
        return false;
   },

    type: 'TrackLongInactiveUserLogin'
};
