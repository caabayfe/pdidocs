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
    var payload = {};
    if (api.state.searchTerm) {
        payload.skillProductNameMapping = api.state.skillProductNameMapping;
        payload.matchingSysIds = getMatchingSysIdsForProductName(api.state.skillProductNameMapping, api.state.searchTerm)

    }
        api.setState('currPageNumber', event.payload.value);
    api.data.fetch_skills_based_on_providers_1.execute({
        "page_number": event.payload.value,
        "search_term": api.state.searchTerm,
        'type': api.state.type,
        'payload': payload
    });


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
