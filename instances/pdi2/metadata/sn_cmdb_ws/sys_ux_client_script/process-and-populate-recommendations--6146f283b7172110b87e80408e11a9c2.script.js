/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    api.setState('recommendationsLoading', true);
    api.setState("recommendations", []);
    helpers.snHttp('/api/sn_cmdb_ws/cmdb_workspace_api_scoped/recommendation_card',
        {
            method: 'POST',
            batch: false
        }
    ).then(function({ response }) {
        let configResult = response?.result;
        let outputRecommendationConfigs = configResult?.configs;
        let outputRecommendationTypes = configResult?.recommendationTypes;
        let cards = configResult?.cards;
        let recommendations = [];

        if (!outputRecommendationConfigs || outputRecommendationConfigs.length == 0 || !outputRecommendationTypes) {
            api.setState('recommendationsLoading', false);
            api.setState('recommendations', []);
            api.emit("COLLAPSE_SIDEBAR", {"collapsed": true, "isVertical": true});
            return;
        }

        let stageActions = [];
        for (let card of cards) {
            let record = card;
            if (record && !record.display) {
                continue;
            }
            let cardObj = '';
            let {
                type,
                count,
                description
            } = record;

            let recommendation = outputRecommendationTypes[type.toUpperCase()];
            cardObj = {
                isLoading: false,
                type: record.type,
                title: recommendation.NAME,
                description: description,
                actionLink: {
                    text: recommendation.ACTION_LINK.TEXT,
                    href: recommendation.ACTION_LINK.HREF,
                    type: recommendation.ACTION_LINK.TYPE,
                    route: recommendation.ACTION_LINK.ROUTE,
                    openNewWindow: recommendation.ACTION_LINK.OPEN_NEW_WINDOW
                }
            };
            stageActions.push(cardObj);
        }
        api.setState('recommendations', stageActions);
        if (stageActions.length == 0) {
            api.emit("COLLAPSE_SIDEBAR", {"collapsed": true, "isVertical": true});
        }
        api.setState('recommendationsLoading', false);
    });
}
