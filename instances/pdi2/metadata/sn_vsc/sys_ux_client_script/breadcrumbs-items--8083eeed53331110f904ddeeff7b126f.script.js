/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var recordType = "Hardening setting";
    if (api.context.props.pageName == "all_settings") {
        return [{
            'label': 'All hardening settings',
            'href': 'now/security-center-configuration/all_settings'
        }, {
            "label": recordType
        }];
    } else if (api.context.props.pageName == "hardening_score_comparison") {
        if (api.context.props.table == "sn_vsc_security_check_categories") {
            return [{
                'label': 'Hardening settings comparison',
                'href': 'now/security-center-configuration/hardening_score_comparison'
            }, {
                "label": "Security Check Category"
            }];
        }
        return [{
            'label': 'Hardening settings comparison',
            'href': 'now/security-center-configuration/hardening_score_comparison'
        }, {
            "label": recordType
        }];
    } else {
        return [{
            'label': 'Overview',
            'href': 'now/security-center-configuration/overview'
        }, {
            'label': recordType
        }];
    }
}
