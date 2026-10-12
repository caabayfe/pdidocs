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

    const aaUtil = imports["sn_access_analyzer.AccessanalyzerUIUtil"](api, helpers);
    const payload = api.context.props.payload;
    var tms = api.state.translatedMessages;

    function pageReadyHandler() {
        aaUtil.log("Insights component - pageReadyHandler", JSON.stringify(payload));
        _translate();
        if (payload)
            updateInsights(payload);
    }

    async function _translate() {

        aaUtil.updateState("componentProps", {
            showHeader: false
        });

        const gtt = imports["sn_access_analyzer.GlideTextTranslater"](api);

        let p = {};

        p.role = helpers.translate("role");
        p.group = helpers.translate("group");

        p.viewGroup = helpers.translate("View Group");
        p.viewRole = helpers.translate("View Role");
        p.simulate = helpers.translate("Simulate");

        p.orgInsights = helpers.translate("Org Insights");
        p.peerInsights = helpers.translate("Peer Insights");

        p.peerInsightsRoleDesc = helpers.translate("of {0}’s peers have {1} {2}.", "{userName}", "{entityName}", "{entityType}");
        p.peerInsightsGroupDesc = helpers.translate("of {0}’s peers are in the {1}, {2}.", "{userName}", "{entityType}", "{entityName}");
        p.peerInsightsRoleDescForZero = helpers.translate("None of {0}’s peers have {1} {2}.", "{userName}", "{entityName}", "{entityType}");
        p.peerInsightsGroupDescForZero = helpers.translate("None of {0}’s peers are in the {1}, {2}.", "{userName}", "{entityType}", "{entityName}");

        p.orgInsightsRoleDesc = helpers.translate("of the users in the organisation have {0} {1}.", "{entityName}", "{entityType}");
        p.orgInsightsGroupDesc = helpers.translate("of the users in the organisation are in the {0}, {1}.", "{entityType}", "{entityName}");
        p.orgInsightsRoleDescForZero = helpers.translate("No one in the organisation have {0} {1}.", "{entityName}", "{entityType}");
        p.orgInsightsGroupDescForZero = helpers.translate("No one in the organisation are in the {0}, {1}.", "{entityType}", "{entityName}");

        p.insightsTitle = helpers.translate("What is Access Insights?");
        p.insightsInfo = helpers.translate("Access Insights helps you gain confidence in your Role or Group assignments. It curates stats specifically for you based on a user's peer and organizational level configurations.");

        p.orgInsightsTitle = helpers.translate("What is an Org Insight?");
        p.orgInsightsInfo = helpers.translate("Insights are drawn from the entire organization. This tool evaluates how many users in the organization have a Role or are included in the Group.");

        p.peerInsightsTitle = helpers.translate("What is a Peer Insight?");
        p.peerInsightsInfo = helpers.translate("Insights are derived from users' peers. This tool assesses how many peers have a Role or are included in the Group.");

        p.title = helpers.translate("Access Insights for");

        tms = await gtt.translate(p, "translatedMessages");
        aaUtil.log("Insights component - Translation completed");
    }

    function propertyChangeHandler() {
        if (!event.payload.name || !event.payload.value)
            return;
        aaUtil.log("Insights component - propertyChangeHandler", event.payload.name, event.payload.value);
        aaUtil.updateState("componentProps", 'showLoader', true);

        let payload = Object.assign({
            showHeader: true
        }, event.payload.value);

        updateInsights(payload);
    }


    function navToSetting() {
        if (event.elementId === 'btnEnableInsight') {
            helpers.modal.open('refreshModal');
        }
        aaUtil.navigate({
            external: payload.settingUrl
        });
    }

    async function updateInsights(payload) {
        aaUtil.updateState("componentProps", "title", tms.title + ' ' + payload.userName);
        aaUtil.updateState("emptyStateData", "show", false);

        if(payload.clear) {
            api.setState('insightsData', []);
            return;
        }

        if (payload.showNoDataMessage === true) {
            aaUtil.log('Show no data message');
            showNoDataMessage();
            return;
        }
        api.setState('payload', payload);
        api.setState('insightsData', []);

        let insightsData = payload.insightsData;

        if (insightsData) {
            _updateInsights(payload, insightsData);
            return;
        }

        let conf = await aaUtil.callAccessInsightsDB('loadInsightsConfiguration');

        if (conf.status !== 200) {
            showServerError();
            return;
        }

        if (conf.executionResult.output.result.enabled === false) {
            aaUtil.log("Insights component - not enabled - terminating");
            aaUtil.updateState("componentProps", {
                insightsEnabled: false,
                showHeader: false,
                showLoader: false
            });
            return;
        }

        aaUtil.updateState("componentProps", {
            insightsEnabled: true
        });

        insightsData = await fetchInsightsData(payload);

        if (!insightsData) {
            aaUtil.updateState("componentProps", 'showLoader', false);
            return;
        }

        _updateInsights(payload, insightsData);

    }

    function _updateInsights(payload, insightsData) {
        if (insightsData.length === 0) {
            aaUtil.log("Insights component - No data");
            showNoDataMessage();
            return;
        }

        let list = _prepareInsightsList(insightsData, payload.userName);
        api.setState('insightsData', list);
        aaUtil.log("******* updateInsights success *******");
        aaUtil.updateState("componentProps", {
            insightsRendered: true,
            showLoader: false,
            showHeader: payload.showHeader
        });
    }

    async function fetchInsightsData(payload) {
        aaUtil.log("fetchInsightsData...");
        let ans = await aaUtil.callAccessInsightsDB('getInsightsData', {
            userId: payload.userId,
            groups: payload.groups,
            roles: payload.roles
        });
        if (ans.status !== 200) {
            showServerError();
            return null;
        }
        let insightsData = ans.executionResult.output.result;

        helpers.navigate.setRouteParams({
            params: {
                payload: {
                    action: 'insightsLoaded',
                    widgetName: payload.widgetName,
                    insightsData: insightsData
                }
            }
        });
        return insightsData;
    }

    async function showNoDataMessage() {
        if (!tms.noDataLabel) {
            let values = await Promise.all([
                helpers.translate("No data"),
                helpers.translate("No insights available!")
            ]);
            tms.noDataLabel = values[0];
            tms.noDataContent = values[1];
        }
        _updateEmptyState(tms.noDataLabel, tms.noDataContent, 'no-data');
    }

    async function showServerError() {
        if (!tms.serverErrorLabel) {
            let values = await Promise.all([
                helpers.translate("The server encountered an internal error and couldn't process your request"),
                helpers.translate("You can refresh the page and try again")
            ]);
            tms.serverErrorLabel = values[0];
            tms.serverErrorContent = values[1];
        }
        _updateEmptyState(tms.serverErrorLabel, tms.serverErrorContent, 'unconfigured');
    }

    function _updateEmptyState(label, content, illustration) {
        aaUtil.log("Updating empty state component with label : ", label, ", Content : ", content);
        aaUtil.updateState("componentProps", {
            showLoader: false,
            showHeader: payload.showHeader
        });
        api.setState("emptyStateData", ctx => {
            let data = {
                ...ctx.currentValue
            };
            data.illustration = illustration;
            data.content = content;
            data.show = true;
            data.heading = {
                ...data.heading,
                label
            };
            return data;
        });
    }

    function _prepareInsightsList(result, userName) {
        let res = [];
        let i = 0;
        for (let insight of result) {
            res.push(_createCard(insight, userName));
            i++;
            if (payload.maxItems > 0 && i === payload.maxItems)
                break;
        }
        return res;
    }

    function _createCard(insight, userName) {
        let percentage = parseFloat(insight.usersInEntityCount / insight.totalUsersCount * 100);
        return {
            entityId: insight.entityId,
            entityName: insight.entityName,
            entityType: insight.entityType,
            type: tms[insight.level + "Insights"],
            percentage: percentage > 0 && percentage < 1 ? '< 1 %' : parseFloat(percentage.toFixed(1)) + "%",
            description: getDesc(insight, userName),
            menuItems: _getContextMenuItems(insight)
        };
    }

    function _getContextMenuItems(insight) {
        let id = insight.entityType === "role" ? 'viewRole' : 'viewGroup';
        return [{
            icon: "open-link-outline",
            id: "simulate",
            label: tms.simulate
        }, {
            icon: "open-link-outline",
            id: id,
            label: tms[id]
        }];
    }

    function getDesc(insight, userName) {
        // Key would be as below
        // peerInsightsDesc, orgInsightsDesc, peerInsightsDescForZero, orgInsightsDescForZero
        let key = insight.level;

        if (insight.entityType === 'role') {
            key += 'InsightsRoleDesc';
        } else if (insight.entityType === 'group') {
            key += 'InsightsGroupDesc';
        }

        if (insight.usersInEntityCount === 0) {
            key += 'ForZero';
        }

        let desc = tms[key];
        desc = desc.replace("{userName}", userName);
        desc = desc.replace("{entityType}", tms[insight.entityType]);
        desc = desc.replace("{entityName}", '<b>' + insight.entityName + '</b>');
        return '[' + insight.usersInEntityCount + ' / ' + insight.totalUsersCount + '] ' + desc;
    }


    function refreshInsights() {
        helpers.modal.close('refreshModal');
        updateInsights(api.state.payload);
    }


    const fnMap = {
        MACROPONENT_READY: pageReadyHandler,
        MACROPONENT_PROPERTY_CHANGED: propertyChangeHandler,
        btnEnableInsight: navToSetting,
        btnInsightSetting: navToSetting,
        btnRefreshInsights: refreshInsights
    };

    const fn = fnMap[event.name] || fnMap[event.elementId];
    if (fn)
        fn();
}
