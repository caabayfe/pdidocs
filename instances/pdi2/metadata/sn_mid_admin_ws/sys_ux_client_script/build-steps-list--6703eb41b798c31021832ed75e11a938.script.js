/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const os = api.context.props.midServerOS;
    const installType = api.context.props.installMethod;
    const authType = api.context.props.authType;

    var STEP_CATALOG = api.state.stepsCatalog;

    var dynamicCommands = {};

if (authType === 'ipki') {
    const [generatingKey, generatingCommand] = await Promise.all([
        helpers.translate('mid_setup_generating_key', 'Generating key...'),
        helpers.translate('mid_setup_generating_command', 'Generating command...')
    ]);
    dynamicCommands = {
        'generate_token_ipki': '<p>' + generatingKey + '</p>',
        'run_installation_windows_silent': '<p>' + generatingCommand + '</p>',
        'run_installation_linux_silent': '<p>' + generatingCommand + '</p>'
    };
}

    var stepsList = [];
    for (var i = 0; i < STEP_CATALOG.length; i++) {
        var step = STEP_CATALOG[i];
        var c = step.conditions;

        if (c.os && c.os.indexOf(os) === -1) continue;
        if (c.installType && c.installType.indexOf(installType) === -1) continue;
        if (c.authType && c.authType.indexOf(authType) === -1) continue;

        stepsList.push({
            id: step.id,
            title: step.title,
            status: step.status,
            showTimer: step.showTimer,
            timerValue: step.timerValue,
            showRegenerateKey: step.showRegenerateKey,
            bodyText: step.bodyText,
            downloadFile: step.downloadFile,
            command: dynamicCommands[step.id] || step.command,
            showDivider: step.showDivider
        });
    }

    api.setState('stepsList', stepsList);
}
