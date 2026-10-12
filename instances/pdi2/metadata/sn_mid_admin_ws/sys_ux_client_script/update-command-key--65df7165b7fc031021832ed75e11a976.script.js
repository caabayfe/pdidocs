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
    const ipkiCommand = api.data.get_ipki_install_command.output.command;
    const user = api.state.midUser || '199c26c8bf34c31021833d3fe049f938';
    const regKey = api.state.regKey;
    var keyCommand = null;

    var stepsList = api.state.stepsList;
    if (!stepsList) return;

    if (regKey) {
        keyCommand = '<code>&lt;parameter name="mid.ipki.registration_key" secure="true" value="' + regKey + '"/&gt;<br><br>' +
            '&lt;parameter name="mid.ipki.user" secure="true" value="' + user + '"/&gt;</code>';
    }

    var dynamicCommands = {
        'generate_token_ipki': keyCommand,
        'run_installation_windows_silent': ipkiCommand,
        'run_installation_linux_silent': ipkiCommand
    };

    var updated = stepsList.map(function(step) {
        if (dynamicCommands[step.id]) {
            return Object.assign({}, step, {
                command: dynamicCommands[step.id]
            });
        }
        return step;
    });

    api.setState('stepsList', updated);
}
