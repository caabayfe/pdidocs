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
    var res = {};
    Object.keys(api.context.props).forEach(function (propName) {

        if (api.context.props[propName])
            res[propName] = api.context.props[propName];
    });
    api.data.fetch_skills_based_on_providers_1.execute({
        "type": "fetch_fn_group_provider_data",
    });
    if (res?.groupId) {
        api.setState('scopeTypeSelection', 'customize')

    } else
        if (res?.skillId) {
            api.setState('scopeTypeSelection', 'customize')
        }

    api.setState('pageParams', res)
}
