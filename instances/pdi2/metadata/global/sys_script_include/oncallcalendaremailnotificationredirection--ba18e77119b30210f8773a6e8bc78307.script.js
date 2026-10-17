var OnCallCalendarEmailNotificationRedirection = Class.create();
OnCallCalendarEmailNotificationRedirection.prototype = {

    OC_CAL_SOW_URL_PREFIX: '/now/sow/schedules',
    OC_CAL_UI16_URL_PREFIX: '/$oc.do',
    UI16_CAL_PARAMS_MAP: {
        context_date: {
            PARAM_KEY: "sysparm_start_date"
        },
        group: {
            PARAM_KEY: "sysparm_group_id"
        },
        view: {
            PARAM_KEY: "sysparm_current_view",
            PARAM_VAL: {
                day: "daily",
                week: "weekly",
                month: "monthly"
            }
        }
    },
    SOW_CAL_PARAMS_MAP: {
        context_date: {
            PARAM_KEY: "selected-date"
        },
        group: {
            PARAM_KEY: "selected-group"
        },
        view: {
            PARAM_KEY: "selected-view",
            PARAM_VAL: {
                day: "DAY",
                week: "WEEK",
                month: "MONTH"
            }
        }
    },

    initialize: function() {},

    getRedirectionURL: function(type, params) {
        var emailRedirectAPI = new global.EmailNotificationRedirection();
        if (emailRedirectAPI.isSowRedirectionEnabled() && new OnCallCommon().isSowRedirectionEnabledForOnCall() && gs.hasRole('sn_sow.sow_user')) {
            return this._buildSOWCalUrlWithParams(params);
        } else {
            return this._buildUI16CalUrlWithParams(params);
        }
    },

    _buildUI16CalUrlWithParams: function(params) {
        var url = this.OC_CAL_UI16_URL_PREFIX;
        if (!typeof params == "object" || !Object.keys(params).length) return url;
        var paramMap = this.UI16_CAL_PARAMS_MAP;
        Object.keys(params).forEach(function(key, ind) {
            var val = params[key];
            var joinChar = (ind === 0) ? "?" : "&";
            if (key && val) {
                if (key == "context_date") val = new GlideDateTime(params[key]).getLocalDate();
                var param = paramMap[key];
                url += joinChar + param.PARAM_KEY;
                if (param.hasOwnProperty("PARAM_VAL")) {
                    url += "=" + param.PARAM_VAL[val];
                } else {
                    url += "=" + val;
                }
            }
        });
        return url;
    },

    _buildSOWCalUrlWithParams: function(params) {
        var url = this.OC_CAL_SOW_URL_PREFIX;
        if (!typeof params == "object" || !Object.keys(params).length) return url;
        url += "/params";
        var paramMap = this.SOW_CAL_PARAMS_MAP;
        Object.keys(params).forEach(function(key) {
            var val = params[key];
            if (key && val) {
                if (key == "context_date") val = new GlideDateTime(params[key]).getNumericValue();
                var param = paramMap[key];
                url += "/" + param.PARAM_KEY;
                if (param.hasOwnProperty("PARAM_VAL")) {
                    url += "/" + param.PARAM_VAL[val];
                } else {
                    url += "/" + val;
                }
            }
        });
        return url;
    },

    handles: function(type) {
        return type == "oc_cal";
    },

    type: 'OnCallCalendarEmailNotificationRedirection'
};
