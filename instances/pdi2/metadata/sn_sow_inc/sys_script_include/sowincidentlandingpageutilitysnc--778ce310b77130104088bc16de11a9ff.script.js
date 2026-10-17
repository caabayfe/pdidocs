var SOWIncidentLandingPageUtilitySNC = Class.create();
SOWIncidentLandingPageUtilitySNC.prototype = {
    initialize: function() {
        this._initializeColors();
    },

    _initializeColors: function() {
        instanceVersion = gs.getProperty("itsm_family_release_version_check", 0);
        if (instanceVersion <= 24) {
            //for Vancouver and below
            this.REPORT_RANGES_COLORS = {
                "1970-01-01 00:01:00": "critical",
                "1970-01-01 01:00:00": "critical",
                "1970-01-01 08:00:00": "high",
                "1970-01-02 00:00:00": "warning",
                "1970-01-03 00:00:00": "info",
                "1970-01-08 00:00:00": "positive"
            };
            this.CHART_COLORS = {
                "incident": {
                    "state": {
                        '1': 'moderate',
                        '2': 'info',
                        '3': 'warning',
                        '6': 'positive',
                        '7': 'high',
                        '8': 'low'
                    },
                    "priority": {
                        '1': 'critical',
                        '2': 'high',
                        '3': 'info',
                        '4': 'low',
                        '5': 'positive'
                    }
                },
                "sc_task": {
                    "state": {
                        '-5': 'warning',
                        '1': 'moderate',
                        '2': 'info',
                        '3': 'positive',
                        '4': 'high',
                        '7': 'low'
                    }
                },
                "task": {
                    "sys_class_name": {
                        'incident': 'purple',
                        'sc_task': 'green-yellow'
                    }
                }
            };
        } else {
            //for Washington and above
            this.REPORT_RANGES_COLORS = {
                "1970-01-01 00:01:00": "critical",
                "1970-01-01 01:00:00": "orange",
                "1970-01-01 08:00:00": "high",
                "1970-01-02 00:00:00": "pink",
                "1970-01-03 00:00:00": "purple",
                "1970-01-08 00:00:00": "teal"
            };
            this.CHART_COLORS = {
                "incident": {
                    "state": {
                        '1': 'teal',
                        '2': 'purple',
                        '3': 'high',
                        '6': 'green-yellow',
                        '7': 'green',
                        '8': 'low'
                    },
                    "priority": {
                        '1': 'critical',
                        '2': 'high',
                        '3': 'purple',
                        '4': 'teal',
                        '5': 'green'
                    }
                },
                "sc_task": {
                    "state": {
                        '-5': 'high',
                        '1': 'moderate',
                        '2': 'teal',
                        '3': 'green',
                        '4': 'orange',
                        '7': 'low'
                    }
                },
                "task": {
                    "sys_class_name": {
                        'incident': 'purple',
                        'sc_task': 'green-yellow'
                    }
                }
            };
        }
    },
    _getSLATimeLeftLabelForIncidentSlaEvamCard: function(targetType, timeLeftDisplayValue, hasBreached, slaTimeLeftLabelValue) {
        if (targetType == "resolution")
            slaTimeLeftLabelValue["label"] = hasBreached == true ? gs.getMessage('Resolution SLA Breached') : gs.getMessage('Resolve in {0}', timeLeftDisplayValue);
        else if (targetType == "response")
            slaTimeLeftLabelValue["label"] = hasBreached == true ? gs.getMessage('Response SLA Breached') : gs.getMessage('Respond in {0}', timeLeftDisplayValue);
        else
            slaTimeLeftLabelValue["label"] = hasBreached == true ? gs.getMessage('SLA Breached') : gs.getMessage('SLA time left {0}', timeLeftDisplayValue);
        return slaTimeLeftLabelValue;
    },

    _getSLATimeLeftLabelValueForIncidentEvamCard: function(targetType, timeLeftDisplayValue, hasBreached, slaTimeLeftLabelValue) {
        if (targetType == "resolution")
            slaTimeLeftLabelValue["label"] = hasBreached == true ? gs.getMessage('Resolution SLA') : gs.getMessage('Resolve in');
        else if (targetType == "response")
            slaTimeLeftLabelValue["label"] = hasBreached == true ? gs.getMessage('Response SLA') : gs.getMessage('Respond in');
        else
            slaTimeLeftLabelValue["label"] = hasBreached == true ? gs.getMessage('SLA') : gs.getMessage('SLA time left');

        slaTimeLeftLabelValue["value"] = hasBreached == true ? gs.getMessage('Breached') : timeLeftDisplayValue;
        return slaTimeLeftLabelValue;
    },

    getSLATimeLeftLabelValueForEvamCard: function(table, targetType, timeLeftDisplayValue, hasBreached) {
        var slaTimeLeftLabelValue = {
            "label": "",
            "value": ""
        };

        if (table == "task_sla") {
            return this._getSLATimeLeftLabelForIncidentSlaEvamCard(targetType, timeLeftDisplayValue, hasBreached, slaTimeLeftLabelValue);
        } else {
            return this._getSLATimeLeftLabelValueForIncidentEvamCard(targetType, timeLeftDisplayValue, hasBreached, slaTimeLeftLabelValue);
        }
    },

    type: 'SOWIncidentLandingPageUtilitySNC'
};
