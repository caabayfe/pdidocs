function include({imports}) {
    var exports = {};

    var NAME_EXCLUSIONS = ['EJBCA', 'PKI', 'LDAP', 'CRL'];
    var NAME_TRANSFORMS = {
        'IKEK': 'Instance Key Encryption Key',
        'IHMAC': 'Instance HMAC Key',
        'ICSK': 'Instance Certificate Signing Key',
        'IAEK': 'Instance Asymmetric Encryption Key',
        'ISK': 'Instance Signing Key',
        'KEY_SECURE': 'Hardware Root of Trust',
    };
    var UNK_COMPONENT = {id: "UNKNOWN", health: "UNKNOWN", warnings: []};

    /**
     * Transform a KMF Component ID to its friendly name.
     */
    function componentIdToName(id) {
        var output = "";
        var words = id.split('_');
        for (var i = 0; i < words.length; ++i) {
            var word = words[i];
            if (i > 0)
                output += " ";
            if (NAME_EXCLUSIONS.indexOf(word) !== -1)
                output += word;
            else {
                var transformed = NAME_TRANSFORMS[word];
                if (transformed)
                    output += transformed;
                else if (word.length <= 1)
                    output += word;
                else
                    output += word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }
        }
        return output;
    }

    exports['componentIdToName'] = componentIdToName;

    function __walkToComponent(snKmfUi, componentPath) {
        if (!snKmfUi)
            return UNK_COMPONENT;

        var component = snKmfUi;
        var children = component.children;
        var id = "UNKNOWN";
        for (let i = 0; i < componentPath.length; ++i) {
            id = componentPath[i];
            component = children[id];
            if (!component) {
                console.warn("Non-existent component: " + componentPath.join('.'));
                return UNK_COMPONENT;
            }
            children = component.children;
            if (!children && i !== componentPath.length - 1) {
                console.warn("Non-parent component " + id + " in " + componentPath.join('.'));
                return UNK_COMPONENT;
            }
        }

        return Object.assign({}, component, {id});
    }

    async function __componentHealthToLabel(component, helpers) {
        if (!component)
            return await helpers.translate("Checking");

        if (!component.health)
            return await helpers.translate("Unknown");

        switch (component.health) {
            case "RED":
                return await helpers.translate("Malfunction");
            case "YELLOW":
                return await helpers.translate("Degraded");
            case "GREEN":
                return await helpers.translate("Operational");
            case "GRAY":
                return await helpers.translate("Disabled");
            default:
                return await helpers.translate("Unknown");
        }
    }

    function __componentHealthToColor(component) {
        if (!component || !component.health)
            return 'moderate';

        switch (component.health) {
            case "RED":
                return 'critical';
            case "YELLOW":
                return 'high';
            case "GREEN":
                return 'positive';
            case "GRAY":
                return 'low';
            default:
                return 'moderate';
        }
    }

    function __componentHealthToVariant(component) {
        if (!component || !component.health)
            return 'tertiary';

        switch (component.health) {
            case "RED":
            case "YELLOW":
                return 'primary';
            case "GREEN":
            case "GRAY":
            default:
                return 'tertiary';
        }
    }

    async function __parseComponentHealth(problems, snKmfUi, componentPath, helpers) {
        const component = __walkToComponent(snKmfUi, componentPath);

        if (problems && (component.health === 'YELLOW' || component.health === 'RED'))
            problems.push(componentIdToName(component.id));
        
        return {
            health: component.health,
            statusColor: __componentHealthToColor(component),
            statusVariant: __componentHealthToVariant(component),
            statusLabel: await __componentHealthToLabel(component, helpers),
            warnings: component.warnings
        };
    }

    async function __buildInfoBox(state, api, helpers) {
        // If KMF is not enabled (no root wrapper...)
        if (!state.health.rootKeyWrappers.enabled) {
            // If we're maint...
            if (api.context.session.user.roles.indexOf('maint') !== -1) {
                // If we're in DC...
                if (state.instanceType === "DATACENTER")
                    return {
                        icon: 'circle_close_outline',
                        type: 'critical',
                        message: await helpers.translate("The Key Management Framework is not properly installed on this cloud instance."),
                        link: {
                            "label": "Learn more.",
                            "href": "https://support.servicenow.com/kb?id=kb_article_view&sysparm_article=KB0965129#u_kb_resolution",
                            "target": "_blank"
                        }
                    }
                if (state.instanceType === "SELF_HOSTED")
                    return {
                        type: 'high',
                        icon: 'diamond_exclamation_outline',
                        message: await helpers.translate("The Key Management Framework is not configured on this on-premise instance."),
                        link: {
                            "label": "Learn more.",
                            "href": "https://support.servicenow.com/kb?id=kb_article_view&sysparm_article=KB0951869",
                            "target": "_blank"
                        }
                    }
                return {
                    icon: 'circle_close_outline',
                    type: 'critical',
                    message: await helpers.translate("The Key Management Framework is not configured on this instance."),
                }
            }
            return {
                type: 'high',
                icon: 'diamond_exclamation_outline',
                message: await helpers.translate("The Key Management Framework doesn't appear configured. Please check again in a few days and raise a request if the issue persists."),
                link: {
                    "label": "Get help.",
                    "href": "https://support.servicenow.com/",
                    "target": "_blank"
                }
            }
        }

        // If we're maint...
        if (api.context.session.user.roles.indexOf('maint') !== -1)
            return {
                type: 'info',
                icon: 'circle_info_outline',
                message: await helpers.translate("For more information about this page, please check the related article."),
                link: {
                    "label": "Learn more.",
                    "href": "https://support.servicenow.com/kb?id=kb_article_view&sysparm_article=KB1002078",
                    "target": "_blank"
                }
            }
        return {hide: true};
    }

    exports['loadState'] = async function(snKmfUi, api, helpers) {
        var problems = [];
        var health = {
            overall: await __parseComponentHealth(null, snKmfUi, [], helpers),
            rootKeyWrappers: await (async function() {
                var health = {
                    keySecure: await (async function() {
                        var health = await __parseComponentHealth(problems, snKmfUi, ["KEY_SECURE"], helpers);
                        health["enabled"] = (health.health !== "GRAY");
                        return health;
                    })(),
                    fileKeyStore: await (async function() {
                        var health = await __parseComponentHealth(problems, snKmfUi, ["FILE_KEY_STORE"], helpers);
                        health["enabled"] = (health.health !== "GRAY");
                        return health;
                    })(),
                };
                health["enabled"] = (health['keySecure'].enabled || health['fileKeyStore'].enabled);
                return health;
            })(),
            instanceKeys: {
                keyEncryptionKey: await __parseComponentHealth(problems, snKmfUi, ["IKEK"], helpers),
                hmacKey: await __parseComponentHealth(problems, snKmfUi, ["IHMAC"], helpers),
            },
            cryptoModules: {
                glideEncrypter: await __parseComponentHealth(problems, snKmfUi, ["GLIDE_ENCRYPTER"], helpers),
            },
            snPki: await (async function() {
                var health = {
                    ldap: await (async function() {
                        const health = await __parseComponentHealth(problems, snKmfUi, ["EJBCA_PKI"], helpers);
                        health["conn"] = await __parseComponentHealth(null, snKmfUi, ["EJBCA_PKI", "LDAP"], helpers);
                        health["iaek"] = await __parseComponentHealth(null, snKmfUi, ["EJBCA_PKI", "IAEK"], helpers);
                        health["isk"] = await __parseComponentHealth(null, snKmfUi, ["EJBCA_PKI", "ISK"], helpers);
                        health["enabled"] = (health["iaek"].health !== "GRAY");
                        health["hide"] = !health["enabled"];
                        return health;
                    })(),
                    vault: await (async function() {
                        const health = await __parseComponentHealth(problems, snKmfUi, ["VAULT_PKI"], helpers);
                        health["conn"] = await __parseComponentHealth(null, snKmfUi, ["VAULT_PKI", "VAULT_CONNECTIVITY"], helpers);
                        health["iaek"] = await __parseComponentHealth(null, snKmfUi, ["VAULT_PKI", "IAEK"], helpers);
                        health["isk"] = await __parseComponentHealth(null, snKmfUi, ["VAULT_PKI", "ISK"], helpers);
                        health["enabled"] = (health["conn"].health !== "GRAY");
                        health["hide"] = !health["enabled"];
                        return health;
                    })(),
                }
                health["enabled"] = (health["ldap"].enabled || health["vault"].enabled);
                health["hide"] = !health["enabled"];
                return health;
            })(),
            instancePki: await (async function() {
                const health = await __parseComponentHealth(problems, snKmfUi, ["INSTANCE_PKI"], helpers);
                health["icsk"] = await __parseComponentHealth(null, snKmfUi, ["INSTANCE_PKI", "ICSK"], helpers);
                health["issuingCertificate"] = await __parseComponentHealth(null, snKmfUi, ["INSTANCE_PKI", "ISSUING_CERTIFICATE"], helpers);
                health["crlEndpoint"] = await __parseComponentHealth(null, snKmfUi, ["INSTANCE_PKI", "CRL_ENDPOINT"], helpers);
                health["enabled"] = (health["issuingCertificate"].health !== "GRAY");
                health["hide"] = !health["enabled"];
                return health;
            })(),
        };

        // Force the overall state to be RED if KMF isn't configured.
        if (!health.rootKeyWrappers.enabled)
            health['overall'].health = "RED";
        
        var state = Object.assign({
            loading: false,
            instanceType: snKmfUi && snKmfUi.instanceType || "UNKNOWN",
            config: {
                // The PKI that the instance is currently using
                currentPki: (function() {
                    if (health.snPki.ldap.enabled)
                        return "LDAP";
                    if (health.snPki.vault.enabled)
                        return "Vault";
                    return null;
                })(),
            },
            statusIcons: {
                green: health.overall.health !== "GREEN",
                yellow: health.overall.health !== "YELLOW",
                red: health.overall.health !== "RED",
            },
            statusString: await (async function() {
                switch (health.overall.health) {
                    case "RED":
                        return await helpers.translate('Key Management Framework is currently unavailable.');
                    case "YELLOW": {
                        if (problems.length === 0)
                            return await helpers.translate('An item requires your attention.');
                        if (problems.length === 1)
                            return await helpers.translate('An item requires your attention: {0}.', problems[0]);
                        return await helpers.translate('Several items require your attention: {0}.', problems.join(', '));
                    }
                    case "GREEN":
                        return await helpers.translate('Everything looks good. Have a nice day!');
                    default:
                        return await helpers.translate('Hold tight while we check your instance...');
                }
            })(),
            lastChecked: snKmfUi && new Date(snKmfUi.date + 'Z').toLocaleTimeString() || "now",
            health,
        }, problems);
        state['infoBox'] = await __buildInfoBox(state, api, helpers);
        return state;
    }

    return exports;
}
