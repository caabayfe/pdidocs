var SOWIncidentLandingPageTier2UtilitySNC = Class.create();
SOWIncidentLandingPageTier2UtilitySNC.prototype = {
    initialize: function() {
        instanceVersion = gs.getProperty("itsm_family_release_version_check", 0);
        this.CHART_COLORS = {
            "incident": {
                "state": {
                    '1': 'teal',
                    '2': 'purple',
                    '3': 'high',
                    '6': 'green-yellow',
                    '7': 'green',
                    '8': 'low'
                }
            },
            "problem": {
                "state": {
                    '101': 'info',
                    '102': 'teal',
                    '106': 'green',
                    '104': 'green-yellow',
                    '103': 'purple'
                }
            },
            "change_request": {
                "state": {
                    '0': 'green',
                    '-1': 'green-yellow',
                    '-2': 'pink',
                    '-3': 'high',
                    '-4': 'purple',
                    '-5': 'info'
                }
            },
            "task": {
                "sys_class_name": {
                    'change_task': 'green',
                    'incident_task': 'teal',
                    'problem_task': 'pink',
                    'sc_task': 'moderate',
                    'incident': 'blue',
                    'problem': 'critical',
                    'change_request': 'info'
                }
            }
        };
        if (instanceVersion <= 24) {
            //for Vancouver and below
            this.CHART_COLORS.incident = {
                "state": {
                    '1': 'moderate',
                    '2': 'info',
                    '3': 'warning',
                    '6': 'positive',
                    '7': 'high',
                    '8': 'low'
                }
            };
        }
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
        return this._getSLATimeLeftLabelValueForIncidentEvamCard(targetType, timeLeftDisplayValue, hasBreached, slaTimeLeftLabelValue);
    },

    type: 'SOWIncidentLandingPageTier2UtilitySNC'
};
