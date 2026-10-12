var MIUtil = Class.create();
MIUtil.prototype = {

    initialize: function() {},
    ONE_DAY_IN_MILLIS: (1000 * 60 * 60 * 24),

    TRANSLATION_MAP: {
        "Machine identity name": gs.getMessage("Machine identity name"),
        "Last API accessed time": gs.getMessage("Last API accessed time"),
        "Resource": gs.getMessage("Resource"),
        "Method": gs.getMessage("Method"),
        "Type": gs.getMessage("Type"),
        "Last UI login time": gs.getMessage("Last UI login time"),
        "Authentication method": gs.getMessage("Authentication method"),
        "Days since last API accessed": gs.getMessage("Days since last API accessed"),
        "Created date": gs.getMessage("Created date"),
        "Last UI login date": gs.getMessage("Last UI login date"),
        "High privilege role": gs.getMessage("High privilege role")
    },

    getLabel: function(key) {
        return this.TRANSLATION_MAP[key];
    },

    /**
     * The definition of MI Integration Account: The accounts have WSA true in sys_user table +
     * the accounts which is making API calls (entries from sys_mi_user_tracker)
     * exclude wsa=true from mi_user_tracker table since it is being included from sys_user table
     * if wsa is empty, it means wsa=false
     */
    getIntegrationAccountCount: function() {
        var userGA = new GlideAggregate('sys_user');
        // wsa = true and active = true
        userGA.addEncodedQuery('web_service_access_only=true^active=true');
        var wsaCount = this.getAggregateResult(userGA);

        var miUserTrackerGA = new GlideAggregate('sys_mi_user_tracker');
        // (wsa = false or wsa is empty) and active = true
        miUserTrackerGA.addEncodedQuery('user.web_service_access_only=false^ORuser.web_service_access_onlyISEMPTY^user.active=true');
        var callsCount = this.getAggregateResult(miUserTrackerGA);

        return wsaCount + callsCount;
    },

    /**
     * get high priviliged user count from MI account using mi_high_privileged_users (view)
     * (WSA=true OR accounts has made API call) AND active users AND has priviledged roles
     *
     * @returns {number}
     */
    getHighPrivilegedUserCount: function() {
        var ga = new GlideAggregate('mi_high_privileged_users');
        var gaOr = ga.addQuery('sysuser_web_service_access_only', true);
        gaOr.addOrCondition('miuser_last_used', '!=', null);
        ga.addAggregate("COUNT(DISTINCT", 'sysuser_sys_id');
        ga.setGroup(false);
        ga.query();
        ga.next();
        return parseInt(ga.getAggregate("COUNT(DISTINCT", 'sysuser_sys_id'));
    },

    getAggregateResult: function(glideAggregate) {
        glideAggregate.addAggregate("COUNT");
        glideAggregate.query();
        glideAggregate.next();
        return parseInt(glideAggregate.getAggregate("COUNT"));
    },

    getUiLoginAndIntegrationDetail: function(machineIdentity) {
        var returnVal = {};

        var gr = new GlideRecord('sys_mi_request');
        gr.addQuery('user', machineIdentity);
        gr.query();
        gr.next();
        returnVal.lastApiAccessed = gr.mi_resource.resource.getDisplayValue();
        returnVal.lastApiAccessedTime = gr.last_used.getDisplayValue();
        returnVal.userSysId = gr.user.user.sys_id.getValue();
        returnVal.userDisplayName = gr.user.user.name.getDisplayValue();
        returnVal.webServiceAccessOnly = gr.user.user.web_service_access_only.getDisplayValue();

        gr = new GlideRecord('sys_user_login_history');
        gr.addQuery('user', returnVal.userSysId);
        gr.query();
        gr.next();
        returnVal.lastLoginTime = gr.login_time.getDisplayValue();

        return returnVal;
    },

    getWsaFalseDetail: function(machineIdentity) {
        var returnVal = {};

        var gr = new GlideRecord('sys_mi_user_tracker');
        gr.addQuery('sys_id', machineIdentity);
        gr.query();
        gr.next();
        returnVal.lastApiAccessedTime = gr.last_used.getDisplayValue();
        returnVal.userSysId = gr.user.sys_id.getValue();
        returnVal.userDisplayName = gr.user.name.getDisplayValue();
        returnVal.webServiceAccessOnly = gr.user.web_service_access_only.getDisplayValue();

        gr = new GlideRecord('sys_mi_request');
        gr.addQuery('user', machineIdentity);
        gr.query();
        returnVal.lastApiAccessed = gr.next() ? gr.mi_resource.resource.getDisplayValue() : gs.getMessage("(Not available, >30 days ago)");
        return returnVal;
    },

    getInactiveAccountDetail: function(userSysId) {
        var returnVal = {};

        var gr = new GlideRecord('sys_user');
        gr.addQuery('sys_id', userSysId);
        gr.query();
        gr.next();
        returnVal.userSysId = userSysId;
        returnVal.userDisplayName = gr.name.getDisplayValue();
        returnVal.active = gr.active.getDisplayValue();
        returnVal.createdDate = gr.sys_created_on.getDisplayValue();

        gr = new GlideRecord('sys_mi_user_tracker');
        gr.addQuery('user', userSysId);
        gr.query();
        if (gr.next()) {
            returnVal.lastApiAccessedTime = gr.last_used.getDisplayValue();
            returnVal.daysSinceLastApiAccess = this.getDaysSinceToday(gr.last_used.getValue());
        } else {
            returnVal.lastApiAccessedTime = "-";
            returnVal.daysSinceLastApiAccess = "-";
        }

        return returnVal;
    },

    /**
     * return no of days or -1 if not valid start date
     */
    getDaysSinceToday: function(startDate) {
        if (!startDate) return -1;
        var sd = new GlideDateTime(startDate);
        var ed = new GlideDateTime();
        var diff = ed.getDate().getNumericValue() - sd.getDate().getNumericValue();
        return parseInt(diff / 86400000); // 24 * 60 * 60 * 1000
    },

    updatePageProperty: function(name, value) {
        var gr = new GlideRecord('sys_ux_page_property');
        gr.addQuery('name', 'app_config');
        gr.addQuery('page', 'acf0f6ff4322121000d119405bb8f299'); //sys_ux_page_registry's sys-id of Machine Identity Console
        gr.query();
        if (gr.next()) {
            var json = JSON.parse(gr.getValue('value'));
            json[name] = value;
            gr.value = JSON.stringify(json, null, 2);
            gr.setWorkflow(false);
            gr.setUseEngines(false);
            gr.autoSysFields(false);
            gr.update();
        }
    },

    type: 'MIUtil'
};
