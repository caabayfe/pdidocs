var NAANowAssistPanelAPI = {

    nowAssistPanelStatusAPI: function() {
        var result = {};
        try {
            result.status = 200;
            result.body = {
                nowAssistPanelEnabled: NAAConstant.CONFIG.isNowAssistPanelEnabled(),
            };
        } catch (e) {
            result.status = 400;
            result.body = {
                error: e
            };
        }
        return result;
    },

    type: 'NAANowAssistPanelAPI'
};
