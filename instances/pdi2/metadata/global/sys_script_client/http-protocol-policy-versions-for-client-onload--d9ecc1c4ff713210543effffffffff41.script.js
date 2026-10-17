
      function onLoad() {
    updateProtocolPolicyOptions(g_form.getValue('http_client_version'));
}

function updateProtocolPolicyOptions(clientVersion) {
    var currentValue = g_form.getValue('http_protocol_policy');
    g_form.clearOptions('http_protocol_policy');
    g_form.addOption('http_protocol_policy', 'FORCE_HTTP_1_1', 'Force HTTP/1.1');

    if (clientVersion != 'V1') {
        g_form.addOption('http_protocol_policy', 'FORCE_HTTP_2_0', 'Force HTTP/2.0');
        g_form.addOption('http_protocol_policy', 'PREFER_HTTP_2_0', 'Prefer HTTP/2.0');
        if (currentValue)
          g_form.setValue('http_protocol_policy', currentValue);
    } else {
        g_form.setValue('http_protocol_policy', 'FORCE_HTTP_1_1');
    }
}
