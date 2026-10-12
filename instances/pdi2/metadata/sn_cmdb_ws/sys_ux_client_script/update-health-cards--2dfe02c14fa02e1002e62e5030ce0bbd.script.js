/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const outputHealthScores = api.data.get_cmdb_health_scores_for_ci.outputHealthScores;
    const constants = api.state.constants;

    /* {
        "metric": "Metric Label",     // The metric name
        "type": 0|1,                  // Type flag, 0 indicated a boolean-like indicator, 1 indicates numeric
        "value": 0,                   // Metric value, -1|0|1 for boolean-like type (none/fail/pass), >= 0 for numeric type
        "total": 0,                   // If the value is an integer there should be a total integer as well
        "active": true|false          // Flag indicating if the metric is enabled or not (for graying out)
        "color": -1                   // NOTAPPLICABLE(-1), BEST(0), ATRISK(1), CRITICAL(2);
    } */
   
    let cmdbHealthData = {...api.state.cmdbHealthData};
    cmdbHealthData.cards = api.state.cmdbHealthData.cards.map(item => {
        let newItem = {...item};
        newItem.label = getTranslatedLabel(newItem.metric, newItem.label);
        newItem.infoText = getTranslatedLabel(newItem.metric, newItem.label, true);

        switch(item.metric) {
            case "COMPLETENESS":
                // item.type = 1 (integer), Metrics = [Recommended, Required]
                newItem.data = outputHealthScores.completenessScore.map(obj => {
                    return {
                        ...obj, 
                        "friendly_name": getTranslatedLabel(obj.metric, obj.friendly_name)
                    };
                });
                // REQUIRED comes first, switch order of RECOMMENDED and REQUIRED
                if (newItem.data.length >= 2 && newItem.data[0].metric == "RECOMMENDED") {
                    [newItem.data[0], newItem.data[1]] = [newItem.data[1], newItem.data[0]];
                }
                break;

            case "CORRECTNESS":
                // item.type = 0 (boolean), Metrics = [Duplicate, Orphan, Staleness]
                newItem.data = outputHealthScores.correctnessScore.map(obj => {
                    return {
                        ...obj, 
                        "color_code": getColorCode(obj.color, obj.metric),
                        "indicator_info": getIndicatorInfo(obj)
                    };
                });
                break;

            case "COMPLIANCE": 
                // item.type = 0 (boolean), Metrics = [Audit]
                newItem.data = outputHealthScores.complianceScore.map(obj => {
                    return {
                        ...obj, 
                        "color_code": getColorCode(obj.color, obj.metric),
                        "indicator_info": getIndicatorInfo(obj)
                    };
                });

                break;
                
            case "RELATIONSHIP": 
                // item.type = 1 (integer), Metrics = [Duplicate, Stale]
                newItem.data = outputHealthScores.relationshipScore;
                break;

            case "ATTESTATION":
                newItem.data = outputHealthScores.attestationScore.map(obj => {
                    return {
                        ...obj, 
                        "friendly_name": getTranslatedLabel(obj.metric, obj.friendly_name),
                        "color_code": getColorCode(obj.color, obj.metric),
                        "indicator_info": obj.metric == "STATUS" && !obj.value ? constants.NOT_YET_REVIEWED_TEXT : obj.value
                    };
                });
                break;

            default:
        }
        return newItem;
    });
    api.setState('cmdbHealthData', cmdbHealthData);

    // Functions
    /*  Only for item.type = 0 (boolean) i.e. Compliance, Correctness
        PASSED_WITH_RECONCILED_TASK(-5),
        INAPPLICABLE_IRE_INCL_RULE(-4),
        INAPPLICABLE_HEALTH_INCL_RULE(-3),
        NO_RULE(-2),
        INAPPLICABLE(-1),
        FAILED(0),
        PASSED(1);
    */
    function getIndicatorInfo(indicator) {
        let info = "";
        switch (indicator.value) {
            case 0:
            case 1:
                switch(indicator.metric) {
                    case "AUDIT":
                        info = indicator.value == 1 ? constants.AUDIT_METRIC_PASSED_TEXT : constants.AUDIT_METRIC_FAILED_TEXT;
                        break;
                    case "ORPHAN":
                        info = indicator.value == 1 ? constants.ORPHAN_METRIC_PASSED_TEXT : constants.ORPHAN_METRIC_FAILED_TEXT;
                        break;
                    case "STALENESS":
                        info = indicator.value == 1 ? constants.STALE_METRIC_PASSED_TEXT : constants.STALE_METRIC_FAILED_TEXT;
                        break;
                    case "DUPLICATE":
                        info = indicator.value == 1 ? constants.DUPLICATE_METRIC_PASSED_TEXT : constants.DUPLICATE_METRIC_FAILED_TEXT;
                        break;
                    default:
                        info = constants.INVALID_METRIC_TEXT;
                }
                break;
            case -1:
                info = constants.NOT_APPLICABLE_TEXT;
                break;
            case -2:
                if(indicator.metric === 'AUDIT')
                    info = constants.NO_AUDITS_TEXT;
                else
                    info = constants.NO_RULES_TEXT;
                break;
            case -3:
                info = constants.HEALTH_INCLUSION_RULE_TEXT;
                break;
            case -4:
                info = constants.IDENTIFICATION_INCLUSION_RULE_TEXT;
                break;
            case -5:
                info = constants.DEDUP_REMEDIATION_TEXT;
                break;
            default:
                info = indicator.value;
        }
        return info;
    }

    function getColorCode(color, metric) {
        if (metric == "ATTESTED_ON")
            return null;

        let colorCode = "";

        switch (color) {
            case 0:
                colorCode = "positive";
                break;
            case 1:
                colorCode = "high";
                break;
            case 2:
                colorCode = "critical";
                break;
            default:
                colorCode = "low";
        }
        return colorCode;
    }

    function getTranslatedLabel(metric, friendlyName, info) {
        let label = "";

        switch (metric) {
            case 'COMPLETENESS':
                label = info ? constants.COMPLETENESS_INFO_TEXT : constants.COMPLETENESS_LABEL;
                break;
            case 'COMPLIANCE':
                label = info ? constants.COMPLIANCE_INFO_TEXT : constants.COMPLIANCE_LABEL;
                break;
            case 'CORRECTNESS':
                label = info ? constants.CORRECTNESS_INFO_TEXT : constants.CORRECTNESS_LABEL;
                break;
            case 'RELATIONSHIP':
                label = info ? constants.RELATIONSHIP_INFO_TEXT : constants.RELATIONSHIP_LABEL;
                break;
            case 'ATTESTATION':
                label = info ? constants.ATTESTATION_INFO_TEXT : constants.ATTESTATION_LABEL;
                break;
            case 'REQUIRED':
                label = constants.MISSING_REQUIRED_TEXT;
                break;
            case 'RECOMMENDED':
                label = constants.MISSING_RECOMMENDED_TEXT;
                break;
            case 'STATUS':
                label = constants.ATTESTATION_STATUS_LABEL;
                break;
            case 'ATTESTED_ON':
                label = constants.ATTESTATION_ATTESTED_ON_LABEL;
                break;
            default:
                label = friendlyName || metric;
        }
        return label;
    }
}
