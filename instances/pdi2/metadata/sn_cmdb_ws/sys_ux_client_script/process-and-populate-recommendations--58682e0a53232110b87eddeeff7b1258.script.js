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
            batch: false,
            body: {
                maxCardCount: 2
            }
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
                type: record.type,
                title: recommendation.NAME,
                description: description
            };
            stageActions.push(cardObj);
        }
        api.setState('recommendations', stageActions);
        api.setState('recommendationsLoading', false);
    });
}
