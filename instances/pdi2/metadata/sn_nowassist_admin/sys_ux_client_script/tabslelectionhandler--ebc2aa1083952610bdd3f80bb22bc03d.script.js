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
    const OOB_SKILL_TAB_ID = "id=oob_skills";
    const FUNCTIONAL_SKILL_GROUP_TAB_ID = "id=functional_groups";
    const POLICY_UPDATES = "id=policy_updates";

    var fetchSkillProductMapping = Object.keys(api.state.skillProductNameMapping).length == 0 ? true : false;
    api.setState('searchTerm', '');
    if (event.payload.selectedTab === OOB_SKILL_TAB_ID) {
        api.data.fetch_skills_based_on_providers_1.execute({
            "type": "fetch_skill",
            "payload": {
                "fetchSkillProductMapping": fetchSkillProductMapping
            }
        });
        api.setState('type', 'fetch_skill');
        api.setState('totalRecord', 0);
    } else if (event.payload.selectedTab === FUNCTIONAL_SKILL_GROUP_TAB_ID) {
        api.setState('type', '');
        api.setState('totalRecord', 0);
        api.data.fetch_skills_based_on_providers_1.execute({
            "payload": {
                "fetchSkillProductMapping": fetchSkillProductMapping
            }
        });
    }else if (event.payload.selectedTab === POLICY_UPDATES) {
        api.data.fetch_policy_update_history_1.execute({
            search_term: api.state.policySearchTerm,
            page_number: api.state.policyPageNumber,
            records_per_page: api.state.policyPageSize
        });
    }
}
