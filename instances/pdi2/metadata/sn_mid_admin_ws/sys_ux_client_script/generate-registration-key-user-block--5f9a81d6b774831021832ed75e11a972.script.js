/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const user = api.state.generateKeyModalUserSelection;
    const regKey = api.state.regKey;
    var keyCommand = null;
    var plainCommand = null;

    function htmlEscape(v) {
        return String(v == null ? '' : v)
            .replace(/&/g, '&')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    if (regKey) {
        keyCommand = '<code>&lt;parameter name="mid.ipki.registration_key" secure="true" value="' + htmlEscape(regKey) + '"/&gt;<br><br>' +
            '&lt;parameter name="mid.ipki.user" value="' + htmlEscape(user) + '"/&gt;</code>';
    
    // Plain text version for copying (NO HTML encoding or escaping)
        plainCommand = '<parameter name="mid.ipki.registration_key" secure="true" value="' + regKey + '"/>\n\n' +
        '<parameter name="mid.ipki.user" value="' + user + '"/>';
    }

    api.setState('regKey', keyCommand);
    api.setState('regKeyPlain', plainCommand);
}
