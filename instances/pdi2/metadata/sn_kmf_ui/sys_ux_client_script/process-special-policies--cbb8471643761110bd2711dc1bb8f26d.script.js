/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var systemDefaultPolicyResults = api.data.default_map.output.data.GlideRecord_Query.sys_kmf_crypto_caller_policy._results;
    if (0 == systemDefaultPolicyResults.length)
        return;

    var systemDefaultPolicy = systemDefaultPolicyResults[0];

    (async function(){
        var COLORS = {
            "NEUTRAL": "low",
            "GRANTED": "positive",
            "DENIED_UNLESS_GRANTED": "high",
            "DENIED": "critical"
        };
        var ICONS = {
            "NEUTRAL": "circle-outline",
            "GRANTED": "circle-check-outline",
            "DENIED_UNLESS_GRANTED": "circle-minus-outline",
            "DENIED": "circle-close-outline"
        };
        var LABELS = {
            "NEUTRAL": await helpers.translate("Absent"),
            "GRANTED": await helpers.translate("Track"),
            "DENIED_UNLESS_GRANTED": await helpers.translate("Reject"),
            "DENIED": await helpers.translate("StrictReject")
        };

        function parsePolicy(policy) {
            const url = "/sys_kmf_crypto_caller_policy.do?sys_id=" + policy._row_data.uniqueValue;
            switch (policy.result.value) {
                case "track":
                case "allow":
                case "allow_apis":
                    return {
                        "color": COLORS["GRANTED"],
                        "icon": ICONS["GRANTED"],
                        "label": LABELS["GRANTED"],
                        "url": url,
                    };
                case "reject":
                    return {
                        "color": COLORS["DENIED_UNLESS_GRANTED"],
                        "icon": ICONS["DENIED_UNLESS_GRANTED"],
                        "label": LABELS["DENIED_UNLESS_GRANTED"],
                        "url": url,
                    };
                case "strictreject":
                    return {
                        "color": COLORS["DENIED"],
                        "icon": ICONS["DENIED"],
                        "label": LABELS["DENIED"],
                        "url": url,
                    };
            }
        }

        var DEFAULT = {
            "color": COLORS["NEUTRAL"],
            "icon": ICONS["NEUTRAL"],
            "label": LABELS["NEUTRAL"],
            "disableManageButton": true,
        };

        var policies = api.data.policies.output.data.GlideRecord_Query.sys_kmf_crypto_caller_policy._results;
        var state = {
            "default": parsePolicy(systemDefaultPolicy),
            "system": DEFAULT,
            "platform": DEFAULT,
            "script": DEFAULT,
        };

        for (var i = 0; i != policies.length; ++i) {
            var policy = policies[i];
            if (!policy.type.value) {
                state["default"] = parsePolicy(policy);
                continue;
            }

            switch(policy.type.value) {
                case "5":
                    state["system"] = parsePolicy(policy);
                    break;
                case "6":
                    state["script"] = parsePolicy(policy);
                    break;
                case "7":
                    state["platform"] = parsePolicy(policy);
                    break;
                default:
                    console.log("Encountered unknown policy type: " + policy.type.value);
                    break;
            }
        }

        api.setState("policies", state);
    })();
}
