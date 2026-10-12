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
    const instanceName = api.data.lookup_instance_name_property.output.properties.instance_name;
    const entitlementsWithAssists = api.data.subscription_entitlement_assists_aggregation_query_1.output.data.GlideAggregate_Query[0].count;

    if(Number(entitlementsWithAssists) > 0)
        return;

    const instanceLists = api.data.look_up_sn_entitlement_account_nowassist_purchased.results;
    const instancesArray = [];
    instanceLists.forEach((element) => {
        const value = element.instance_names.value;
        if (value.includes(","))
            instancesArray.push(...value.split(','));
        else
            instancesArray.push(value);
    });

    if (instancesArray.includes(instanceName))
        return;

    helpers.translate('Current instance is not associated with any Gen AI subscriptions, therefore Gen AI skills cannot be utilized. To leverage Gen AI skills, kindly switch to one of the following instance(s): {0}.', [...new Set(instancesArray)].join(', '))
        .then((text) => {
            api.setState('hideAssistInstanceListMessage', false);
            api.setState('assistInstanceList', text);
        });
}
