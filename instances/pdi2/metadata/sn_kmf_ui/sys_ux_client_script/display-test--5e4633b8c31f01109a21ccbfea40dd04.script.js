/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        loadState
    } = imports['sn_kmf_ui.KMFUIHealth']();

    if (!event.payload.value) {
        // Stop display test
        var fd = api.state.displayTest;
        console.log("Stopping KMF Health display test.", fd);
        if (fd == -1)
            return;
        helpers.timing.clearInterval(fd);
        api.data.status.refresh(); // Refresh the actual status.
        return;
    }

    // Start display test.
    function createAllDisabled() {
        return {
            "status": {
                "health": {
                    "health": "GRAY",
                    "date": "2022-05-04 11:01:16",
                    "instanceType": "DEVELOPER",
                    "children": {
                        "KEY_SECURE": {
                            "health": "GRAY",
                            "warnings": []
                        },
                        "FILE_KEY_STORE": {
                            "health": "GRAY",
                            "warnings": []
                        },
                        "GLIDE_ENCRYPTER": {
                            "health": "GRAY",
                            "warnings": []
                        },
                        "IKEK": {
                            "health": "GRAY",
                            "warnings": []
                        },
                        "IHMAC": {
                            "health": "GRAY",
                            "warnings": []
                        },
                        "EJBCA_PKI": {
                            "health": "GRAY",
                            "warnings": [],
                            "children": {
                                "LDAP": {
                                    "health": "GRAY",
                                    "warnings": []
                                },
                                "ISK": {
                                    "health": "GRAY",
                                    "warnings": []
                                },
                                "IAEK": {
                                    "health": "GRAY",
                                    "warnings": []
                                }
                            }
                        },
                        "VAULT_PKI": {
                            "health": "GRAY",
                            "warnings": [],
                            "children": {
                                "VAULT_CONNECTIVITY": {
                                    "health": "GRAY",
                                    "warnings": []
                                },
                                "ISK": {
                                    "health": "GRAY",
                                    "warnings": []
                                },
                                "IAEK": {
                                    "health": "GRAY",
                                    "warnings": []
                                }
                            }
                        },
                        "INSTANCE_PKI": {
                            "health": "GRAY",
                            "warnings": [],
                            "children": {
                                "ISSUING_CERTIFICATE": {
                                    "health": "GRAY",
                                    "warnings": []
                                },
                                "ICSK": {
                                    "health": "GRAY",
                                    "warnings": []
                                },
                                "CRL_ENDPOINT": {
                                    "health": "GRAY",
                                    "warnings": []
                                }
                            }
                        }
                    }
                }
            }
        };
    }
    var STATES = ["GREEN", "YELLOW", "RED"];
    var COMPONENTS = [
        ["KEY_SECURE"],
        ["FILE_KEY_STORE"],
        ["IKEK"],
        ["IHMAC"],
        ["GLIDE_ENCRYPTER"],
        ["EJBCA_PKI", "LDAP"],
        ["EJBCA_PKI", "IAEK"],
        ["EJBCA_PKI", "ISK"],
        ["VAULT_PKI", "VAULT_CONNECTIVITY"],
        ["VAULT_PKI", "IAEK"],
        ["VAULT_PKI", "ISK"],
        ["INSTANCE_PKI", "ICSK"],
        ["INSTANCE_PKI", "ISSUING_CERTIFICATE"],
        ["INSTANCE_PKI", "CRL_ENDPOINT"]
    ];

    function makeFakeResult(helpers, counter) {
        var s = counter % STATES.length;
        var componentToTest = COMPONENTS[(counter - s) / STATES.length];
        var health = Object.assign({}, createAllDisabled());

        var component = health.status.health;
        var children = component.children;
        var id = "UNKNOWN";
        for (var i = 0; i < componentToTest.length; ++i) {
            id = componentToTest[i];
            component = children[id];
            if (!component) {
                console.warn("Non-existent component: " + componentToTest.join('.'));
                return health;
            }
            children = component.children;
            if (!children && i !== componentToTest.length - 1) {
                console.warn("Non-parent component " + id + " in " + componentToTest.join('.'));
                return health;
            }
        }
        component.health = health.status.health.health = STATES[s];
        component.warnings = ["Testing: " + componentToTest.join('.')];
        return health;
    }

    var counter = 0;
    var MAX = COMPONENTS.length * STATES.length;

    var INSTANCE_TYPES = ['DATACENTER', 'SELF_HOSTED', 'DEVELOPER'];

    function tick() {
        var results = makeFakeResult(helpers, counter);
        // Switch b/w instance types.
        var inst = Math.floor((counter % (INSTANCE_TYPES.length * 3)) / INSTANCE_TYPES.length);
        console.log(INSTANCE_TYPES[inst]);
        results.status.health.instanceType = INSTANCE_TYPES[inst];
        loadState(results, api, helpers).then(state => {
            // Unhide everything.
            state.health.snPki.hide = false;
            state.health.snPki.ldap.hide = false;
            state.health.snPki.vault.hide = false;
            state.health.instancePki.hide = false;
            // Force loading.
            state.loading = true;
            const keys = Object.keys(state);
            for (let i = 0; i < keys.length; ++i)
                api.setState(keys[i], state[keys[i]]);
        });
        counter = (counter + 1) % MAX;
    }
    console.log("Starting KMF Health display test.", fd);
    tick();
    var fd = helpers.timing.setInterval(tick, 1000);
    api.setState('displayTest', fd);
}
