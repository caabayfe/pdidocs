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
    var fetchSkillProductMapping = Object.keys(api.state.skillProductNameMapping).length == 0 ? true : false;
    api.setState('searchTerm', event.payload.searchTerm);
    var payload = {};
    if (event.payload.searchTerm) {
        payload.fetchSkillProductMapping = fetchSkillProductMapping;
        payload.matchingSysIds = getMatchingSysIdsForProductName(api.state.skillProductNameMapping, event.payload.searchTerm);
        api.data.fetch_skills_based_on_providers_1.execute({
            "search_term": event.payload.searchTerm,
            "type": api.state.type,
            payload: payload
        });

    } else if (event.payload.searchTerm.length == 0) {
        api.data.fetch_skills_based_on_providers_1.execute({
            "type": api.state.type,
            "payload": {
                "fetchSkillProductMapping": fetchSkillProductMapping
            }
        });
    }

    function getMatchingSysIdsForProductName(skillIdProductNameMapping, searchTerm, ) {
        var sysIds = [];
        if (skillIdProductNameMapping) {
            for (const [key, value] of Object.entries(skillIdProductNameMapping)) {
                if (`${value}`.toLowerCase().includes(searchTerm.toLowerCase())) {
                    sysIds.push(`${key}`);
                }

            }
        }
        return sysIds;


    }
}
