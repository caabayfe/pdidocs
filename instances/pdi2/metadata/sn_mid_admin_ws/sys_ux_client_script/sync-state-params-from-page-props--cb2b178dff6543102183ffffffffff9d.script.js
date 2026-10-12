/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    // Read page props
    const midServerName = api.context.props.midServerName;
    const midServerPurpose = api.context.props.midServerPurpose;
    const midServerUser = api.context.props.midServerUser;
    const midServerProxyHost = api.context.props.midServerProxyHost;
    const midServerProxyPort = api.context.props.midServerProxyPort;
    const midServerServiceName = api.context.props.midServerServiceName;

    // Update state params with page prop values
    api.setState('midName', midServerName);
    api.setState('midPurpose', midServerPurpose);
    api.setState('proxyHostInput', midServerProxyHost);
    api.setState('proxyPortInput', midServerProxyPort);
    api.setState('serviceNameInput', midServerServiceName);
    api.setState('midUserLookup', midServerUser);

    // Set boolean flags based on whether optional values are provided
    api.setState('setProxy', !!midServerProxyHost);
    api.setState('setServiceName', !!midServerServiceName);
    api.setState('setMidUser', !!midServerUser);
}
