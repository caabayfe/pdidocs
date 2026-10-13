var MiUtil = Class.create();

// given a MID Server GlideRecord representing a certain MID Server, return true/false if the MI Stats UI Action
// should be enabled on it's form.
MiUtil.MiMidStatsUiActionCondition = function(midGr) {
    var midStatus = midGr.getValue("status");
    if (!(midStatus == "Up" || midStatus == "Paused" || midStatus == "Upgrading" || midStatus == "Upgrade Failed"))
        return false;
    if (!gs.hasRole("evt_mgmt_admin"))
        return false;
    var miExtCtxGr = new GlideRecord("ecc_agent_ext_context_metric");
    miExtCtxGr.addQuery("status", "Started");
    miExtCtxGr.addQuery("executing_on", midGr.getUniqueValue());
    miExtCtxGr.query();
    return miExtCtxGr.hasNext();
};

MiUtil.IntegerRegex = /^(0|-*[1-9]+[0-9]*)$/;
MiUtil.floatRegex = /^((-)?(0|([1-9][0-9]*))(\.[0-9]+)?)$/;

// a map which maps MID Configuration Parameters to their verification function. Each function should accept a
// MID Config Param GlideRecord object and return an error message string. if it the returned string is nil, 
// then the value set for the config param is valid, otherwise it isn't and it is printed to the user. The functions
// are triggered by a dedicated update/insert Business Rule on ecc_agent_config.
MiUtil.MidConfigParamsVeification = {

    "mid.oi.num_of_anomaly_batcher_tasks": function(midConfigParamGr) {
        var value = midConfigParamGr.getValue("value");
        var err = null;
        if (!MiUtil.IntegerRegex.test(value) || parseInt(value) <= 0)
            err = "Value of mid.oi.num_of_anomaly_batcher_tasks should be a positive integer";
        return err;
    },

    "mid.oi.metric_token_bucket_enabled": function(midConfigParamGr) {
        var value = midConfigParamGr.getValue("value");
        var err = null;
        if (value != "true" && value != "false")
            err = "Value of mid.oi.metric_token_bucket_enabled should be true/false";
        return err;
    },

    "mid.oi.metric_token_bucket_num_tokens": function(midConfigParamGr) {
        var value = midConfigParamGr.getValue("value");
        var err = null;
        if (!MiUtil.IntegerRegex.test(value) || parseInt(value) <= 0)
            err = "Value of mid.oi.metric_token_bucket_num_tokens should be a positive integer";
        return err;
    },

    "mid.oi.metric_token_bucket_fill_interval": function(midConfigParamGr) {
        var value = midConfigParamGr.getValue("value");
        var err = null;
        if (!MiUtil.IntegerRegex.test(value) || parseInt(value) <= 0)
            err = "Value of mid.oi.metric_token_bucket_fill_interval should be a positive integer";
        return err;
    },

    "mid.oi.metric_token_bucket_max_wait_time": function(midConfigParamGr) {
        var value = midConfigParamGr.getValue("value");
        var err = null;
        if (!MiUtil.IntegerRegex.test(value) || parseInt(value) <= 0)
            err = "Value of mid.oi.metric_token_bucket_max_wait_time should be a positive integer";
        return err;
    },

    "mid.oi.metric_token_bucket_rest_observer_enabled": function(midConfigParamGr) {
        var value = midConfigParamGr.getValue("value");
        var err = null;
        if (value != "true" && value != "false")
            err = "Value of mid.oi.metric_token_bucket_rest_observer_enabled should be true/false";
        return err;
    },

    "mid.oi.metric_token_bucket_rest_observer_interval": function(midConfigParamGr) {
        var value = midConfigParamGr.getValue("value");
        var err = null;
        if (!MiUtil.IntegerRegex.test(value) || parseInt(value) <= 0)
            err = "Value of mid.oi.metric_token_bucket_rest_observer_interval should be a positive integer";
        return err;
    },

    "mid.oi.metric_token_bucket_rest_observer_codes": function(midConfigParamGr) {
        gs.addInfoMessage("bla");
        var value = midConfigParamGr.getValue("value");
        var err = null;
        if (gs.nil(value))
            err = "No values given for mid.oi.metric_token_bucket_rest_observer_codes";
        else {
            var valuesArr = value.split(",");
            if (valuesArr.length == 0)
                err = "No values given for mid.oi.metric_token_bucket_rest_observer_codes";
            else {
                for (var i = 0; i < valuesArr.length; i++) {
                    if (!MiUtil.IntegerRegex.test(valuesArr[i]) || parseInt(valuesArr[i]) <= 0) {
                        err = "All values of mid.oi.metric_token_bucket_rest_observer_codes should be positive integers";
                        break;
                    }
                }
            }
        }
        return err;
    },

    "mid.oi.metric_token_bucket_rest_observer_increase_rate": function(midConfigParamGr) {
        var value = midConfigParamGr.getValue("value");
        var err = null;
        if (!MiUtil.floatRegex.test(value) || parseFloat(value) <= 1)
            err = "Value of mid.oi.metric_token_bucket_rest_observer_increase_rate should be a number > 1";
        return err;
    },

    "mid.oi.metric_token_bucket_rest_observer_decrease_rate": function(midConfigParamGr) {
        var value = midConfigParamGr.getValue("value");
        var err = "Value of mid.oi.metric_token_bucket_rest_observer_decrease_rate should be a number in (0, 1)";
        if (MiUtil.floatRegex.test(value)) {
            var floatVal = parseFloat(value);
            if (floatVal > 0 && floatVal < 1)
                err = null;
        }
        return err;
    },

    "mid.oi.metric_token_bucket_rest_observer_max_decrease_rate": function(midConfigParamGr) {
        var value = midConfigParamGr.getValue("value");
        var err = "Value of mid.oi.metric_token_bucket_rest_observer_max_decrease_rate should be a number in (0, 1)";
        if (MiUtil.floatRegex.test(value)) {
            var floatVal = parseFloat(value);
            if (floatVal > 0 && floatVal < 1)
                err = null;
        }
        return err;
    },

    "mid.oi.metric_token_bucket_rest_observer_min_tokens": function(midConfigParamGr) {
        var value = midConfigParamGr.getValue("value");
        var err = null;
        if (!MiUtil.IntegerRegex.test(value) || parseInt(value) < 1)
            err = "Value of mid.oi.metric_token_bucket_rest_observer_min_tokens should be an integer >= 1";
        return err;
    },

    "mid.oi.metric_token_bucket_rest_observer_max_tokens": function(midConfigParamGr) {
        var value = midConfigParamGr.getValue("value");
        var err = null;
        if (!MiUtil.IntegerRegex.test(value))
            err = "Value of mid.oi.metric_token_bucket_rest_observer_max_tokens should be an integer";
        return err;
    },

    "mid.oi.anomaly_token_bucket_enabled": function(midConfigParamGr) {
        var value = midConfigParamGr.getValue("value");
        var err = null;
        if (value != "true" && value != "false")
            err = "Value of mid.oi.anomaly_token_bucket_enabled should be true/false";
        return err;
    },

    "mid.oi.anomaly_token_bucket_num_tokens": function(midConfigParamGr) {
        var value = midConfigParamGr.getValue("value");
        var err = null;
        if (!MiUtil.IntegerRegex.test(value) || parseInt(value) <= 0)
            err = "Value of mid.oi.anomaly_token_bucket_num_tokens should be a positive integer";
        return err;
    },

    "mid.oi.anomaly_token_bucket_fill_interval": function(midConfigParamGr) {
        var value = midConfigParamGr.getValue("value");
        var err = null;
        if (!MiUtil.IntegerRegex.test(value) || parseInt(value) <= 0)
            err = "Value of mid.oi.anomaly_token_bucket_fill_interval should be a positive integer";
        return err;
    },

    "mid.oi.anomaly_token_bucket_max_wait_time": function(midConfigParamGr) {
        var value = midConfigParamGr.getValue("value");
        var err = null;
        if (!MiUtil.IntegerRegex.test(value) || parseInt(value) <= 0)
            err = "Value of mid.oi.anomaly_token_bucket_max_wait_time should be a positive integer";
        return err;
    },

    "mid.oi.anomaly_token_bucket_rest_observer_enabled": function(midConfigParamGr) {
        var value = midConfigParamGr.getValue("value");
        var err = null;
        if (value != "true" && value != "false")
            err = "Value of mid.oi.anomaly_token_bucket_rest_observer_enabled should be true/false";
        return err;
    },

    "mid.oi.anomaly_token_bucket_rest_observer_interval": function(midConfigParamGr) {
        var value = midConfigParamGr.getValue("value");
        var err = null;
        if (!MiUtil.IntegerRegex.test(value) || parseInt(value) <= 0)
            err = "Value of mid.oi.anomaly_token_bucket_rest_observer_interval should be a positive integer";
        return err;
    },

    "mid.oi.anomaly_token_bucket_rest_observer_codes": function(midConfigParamGr) {
        gs.addInfoMessage("bla");
        var value = midConfigParamGr.getValue("value");
        var err = null;
        if (gs.nil(value))
            err = "No values given for mid.oi.anomaly_token_bucket_rest_observer_codes";
        else {
            var valuesArr = value.split(",");
            if (valuesArr.length == 0)
                err = "No values given for mid.oi.anomaly_token_bucket_rest_observer_codes";
            else {
                for (var i = 0; i < valuesArr.length; i++) {
                    if (!MiUtil.IntegerRegex.test(valuesArr[i]) || parseInt(valuesArr[i]) <= 0) {
                        err = "All values of mid.oi.anomaly_token_bucket_rest_observer_codes should be positive integers";
                        break;
                    }
                }
            }
        }
        return err;
    },

    "mid.oi.anomaly_token_bucket_rest_observer_increase_rate": function(midConfigParamGr) {
        var value = midConfigParamGr.getValue("value");
        var err = null;
        if (!MiUtil.floatRegex.test(value) || parseFloat(value) <= 1)
            err = "Value of mid.oi.anomaly_token_bucket_rest_observer_increase_rate should be a number > 1";
        return err;
    },

    "mid.oi.anomaly_token_bucket_rest_observer_decrease_rate": function(midConfigParamGr) {
        var value = midConfigParamGr.getValue("value");
        var err = "Value of mid.oi.anomaly_token_bucket_rest_observer_decrease_rate should be a number in (0, 1)";
        if (MiUtil.floatRegex.test(value)) {
            var floatVal = parseFloat(value);
            if (floatVal > 0 && floatVal < 1)
                err = null;
        }
        return err;
    },

    "mid.oi.anomaly_token_bucket_rest_observer_max_decrease_rate": function(midConfigParamGr) {
        var value = midConfigParamGr.getValue("value");
        var err = "Value of mid.oi.anomaly_token_bucket_rest_observer_max_decrease_rate should be a number in (0, 1)";
        if (MiUtil.floatRegex.test(value)) {
            var floatVal = parseFloat(value);
            if (floatVal > 0 && floatVal < 1)
                err = null;
        }
        return err;
    },

    "mid.oi.anomaly_token_bucket_rest_observer_min_tokens": function(midConfigParamGr) {
        var value = midConfigParamGr.getValue("value");
        var err = null;
        if (!MiUtil.IntegerRegex.test(value) || parseInt(value) < 1)
            err = "Value of mid.oi.anomaly_token_bucket_rest_observer_min_tokens should be an integer >= 1";
        return err;
    },

    "mid.oi.anomaly_token_bucket_rest_observer_max_tokens": function(midConfigParamGr) {
        var value = midConfigParamGr.getValue("value");
        var err = null;
        if (!MiUtil.IntegerRegex.test(value))
            err = "Value of mid.oi.anomaly_token_bucket_rest_observer_max_tokens should be an integer";
        return err;
    }

};

MiUtil.prototype = {
    type: 'MiUtil'
};
