/**
    * @param {params} params
    * @param {api} params.api
    * @param {any} params.event
    * @param {any} params.imports
    * @param {ApiHelpers} params.helpers
    */
    function handler({api, event, helpers, imports}) {
        api.setState('currentTaxonomy', event.payload.value);
        let currentTopicForTaxonomy = api.data.controller.netSelection[event.payload.value];
        api.setState('currentTopics', currentTopicForTaxonomy);
    }
