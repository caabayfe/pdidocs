/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const os = api.context.props.midServerOS;
    const authType = api.context.props.authType;
    const instanceUrl = (api.data.get_instance_url_maw &&
                api.data.get_instance_url_maw.output &&
                api.data.get_instance_url_maw.output.url) || '-';

    const midServerName = api.context.props.midServerName;
    const midServerUser = (api.data.look_up_mid_user &&
                          api.data.look_up_mid_user.result &&
                          api.data.look_up_mid_user.result.user_name.value) || '-';
    const midServerProxyHost = api.context.props.midServerProxyHost;
    const midServerProxyPort = api.context.props.midServerProxyPort;
    const midServerPurpose = api.context.props.midServerPurpose;
    const midServerServiceName = api.context.props.midServerServiceName;

    function item(label, value) {
        return {
            label: label,
            value: {
                type: 'string',
                value: value || '-'
            }
        };
    }

    const [
        labelAuthType, labelOS, labelInstanceUrl,
        labelMidServer, labelMidServerUser, labelMidServerPurpose,
        labelProxyServer, labelServiceName,
        labelSNCert, labelCustomCert, labelBasicAuth,
        labelWindows, labelLinux
    ] = await Promise.all([
        helpers.translate('mid_setup_authentication_type', 'Authentication type'),
        helpers.translate('mid_setup_operating_system', 'Operating system'),
        helpers.translate('mid_setup_instance_url', 'ServiceNow instance URL'),
        helpers.translate('mid_setup_mid_server', 'MID Server'),
        helpers.translate('mid_setup_mid_server_user', 'MID Server user'),
        helpers.translate('mid_setup_mid_server_purpose', 'MID Server purpose'),
        helpers.translate('mid_setup_proxy_server', 'Proxy server'),
        helpers.translate('mid_setup_service_name', 'Service name'),
        helpers.translate('mid_setup_sn_certificate', 'ServiceNow-provided certificate'),
        helpers.translate('mid_setup_custom_certificate', 'Custom Certificate'),
        helpers.translate('mid_setup_basic_authentication', 'Basic authentication')
    ]);

    var authTypeLabel = authType === 'ipki' ? labelSNCert :
                        authType === 'mtls' ? labelCustomCert :
                        authType === 'basic' ? labelBasicAuth : authType;

    var osLabel = os === 'windows' ? 'Windows' :
                  os === 'linux' ? 'Linux' : os;

    var proxyValue = midServerProxyHost ?
        (midServerProxyPort ? midServerProxyHost + ':' + midServerProxyPort : midServerProxyHost) : '-';

    var configSection1 = [
        item(labelAuthType, authTypeLabel),
        item(labelOS, osLabel),
        item(labelInstanceUrl, instanceUrl)
    ];

    var configSection2 = [
        item(labelMidServer, midServerName),
        item(labelMidServerUser, midServerUser),
        item(labelMidServerPurpose, midServerPurpose),
        item(labelProxyServer, proxyValue),
        item(labelServiceName, midServerServiceName)
    ];

    api.setState('midConfigMap', configSection1);
    api.setState('midAdvancedConfigMap', configSection2);
}
