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
    const AICT_URL = "/now/ai-control-tower";
    var data = event.payload.data.output;
    api.setState("columnDefinitions", data.columnDefinitions);
    api.setState("totalRecord", data.totalRecord);
    api.state.type == 'fetch_skill' ? createRowPayload(data.rowPayload, data.skillProductNameMapping) : api.setState("rowPayload", data.rowPayload);
    api.setState("pageSize", data.pageSize);
    if (data.rowPayload && Object.keys(api.state.skillProductNameMapping).length == 0 && Object.keys(data.skillProductNameMapping).length > 0) {
        api.setState('skillProductNameMapping', data.skillProductNameMapping);
    }
    if (data.type == 'FETCH_ALLOWED_PROVIDERS_FROM_AICT') {
        if (api.state.AICTPresent == false) {
            showAICTNotConfiguredAlert(helpers);
        }
        api.setState('fallback', data?.output?.fallback);
        api.setState('approvedProvider', data?.output?.providers);
        api.setState('routing', data?.output?.routing);

    } else if (data.type ==  'FETCH_MIMIR_DEFAULT_PROVIDER') {
        var defaultProviderName = data?.output.mimirDefaultProvider;
         var hideMimirProviderBanner = data?.output.hideMimirProviderBanner;
        if (defaultProviderName && !hideMimirProviderBanner) {
            showMimirDefaultProviderAlert(helpers, defaultProviderName)
        }

    }

    function createRowPayload(rowPayload, skillProductNameMapping) {
        if (skillProductNameMapping && skillProductNameMapping.length == 0)
            skillProductNameMapping = api.state.skillProductNameMapping;
        rowPayload.rows.forEach((item) => {
            item.cells.product.id = skillProductNameMapping[item.key],
                item.cells.product.label = skillProductNameMapping[item.key],
                item.cells.product.value = skillProductNameMapping[item.key]

        });
        api.setState("rowPayload", rowPayload);
    }

    async function showAICTNotConfiguredAlert(helpers) {
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: [{
                id: "aict_not_installed_alert",
                status: "info",
                icon: "bell-outline",
                header: await helpers.translate('Model provider policy is not setup'),
                content: {
                    type: "html",
                    value: await helpers.translate("Set up your organization policy in AI Control Tower to start using the available LLM providers.")
                },
                "textLinkProps": {
                    "href": AICT_URL,
                    "iconEnd": "open-link-right-outline",
                    "label": await helpers.translate("Visit AI Control Tower"),
                    "opensWindow": true,
                    "underlined": true,
                    "variant": "primary"
                },
                action: {
                    type: 'dismiss'
                }

            }]
        });

    }
    async function showMimirDefaultProviderAlert(helpers) {
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: [{
                id: "mimir_default_provider",
                status: "info",
                icon: "bell-outline",
                content: {
                    type: "html",
                    value: await helpers.translate("As per regional regulations, {defaultProviderName} is set as the default model provider for this instance. If you’ve configured a different provider at the instance, skill, or skill group level, that will override {defaultProviderName}", {
                        'defaultProviderName': defaultProviderName
                    })
                },
                action: {
                    type: 'dismiss'
                }

            }]
        });
    }


}
