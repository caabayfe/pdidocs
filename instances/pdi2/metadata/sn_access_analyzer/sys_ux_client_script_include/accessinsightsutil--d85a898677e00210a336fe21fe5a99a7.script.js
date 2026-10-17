function include({imports}, api, helpers) {

    const aaUtil = imports["sn_access_analyzer.AccessanalyzerUIUtil"](api);

    function isEnabled() {
        const enabled = api.state.insights.enabled;
        aaUtil.log("Insights isEnabled ? ", enabled);
        return enabled;
    }

    function updateInsights(widgetName, params = {}) {
        aaUtil.log("updateInsights, widgetName", widgetName);
        api.setState(widgetName, {
            payload: Object.assign({
                    widgetName: widgetName
                }, api.state.insights,
                params.payload)
        });
    }

    function showNoData(widgetName, userName) {
        api.setState(widgetName, {
            payload: {
                ...api.state.insights,
                showHeader: true,
                showNoDataMessage: true,
                userName: userName
            }
        });
    }

    function showServerError(widgetName, userName) {
        api.setState(widgetName, {
            payload: {
                ...api.state.insights,
                showHeader: true,
                showServerError: true,
                userName: userName
            }
        });
    }

    return {
        isEnabled,
        updateInsights,
        showNoData,
        showServerError
    }
}
