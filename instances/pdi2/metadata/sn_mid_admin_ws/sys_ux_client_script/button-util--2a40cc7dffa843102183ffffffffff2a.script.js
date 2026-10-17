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
    const buttonPayload = api.state.buttonPayload;

    if (!buttonPayload || !buttonPayload.action) return;

    const {
        action,
        command,
        downloadFile
    } = buttonPayload;

    if (action === 'copy') {
        if (!command) return;
        const cleanCommand = command.replace(/<\/?code>/g, '');
        helpers.writeText(cleanCommand);
        const copiedMessage = await helpers.translate('mid_setup_copied_to_clipboard', 'Copied to clipboard');
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'copy_success',
                status: 'positive',
                icon: 'circle-check-outline',
                content: {
                    type: 'string',
                    value: copiedMessage
                },
                action: {
                    type: 'dismiss'
                }
            }]
        });
    }

    if (action === 'downloadFile') {
    const downloadConfig = {
        'windows64MSI': { packageName: 'windows64MSI', name: 'mid-windows-installer', architecture: 'x86-64' },
        'windows64ZIP': { packageName: 'windows64ZIP', name: 'mid', architecture: 'x86-64' },
        'linux64RPM': { packageName: 'linux64RPM', name: 'mid-linux-rpm-installer', architecture: 'x86-64' },
        'linux64RPMSign': { packageName: 'linux64RPMSign', name: 'mid-linux-rpm-installer', architecture: 'x86-64' },
        'linux64DEB': { packageName: 'linux64DEB', name: 'mid-linux-deb-installer', architecture: 'x86-64' },
        'linux64DEBSign': { packageName: 'linux64DEBSign', name: 'mid-linux-deb-installer', architecture: 'x86-64' },
        'linux64': { packageName: 'linux64', name: 'mid', architecture: 'x86-64' },
        'linux64DockerRecipe': { packageName: 'linux64DockerRecipe', name: 'mid-linux-container-recipe', architecture: 'x86-64' }
    };

    const config = downloadConfig[downloadFile.value];

    if (!config) {
        return;
    }

    api.setState('packageName', config.packageName);
    api.setState('name', config.name);
    api.setState('architecture', config.architecture);
    api.data.mid_server_downloads_uri.refresh();
}


    // reset after execution
    api.setState('buttonPayload', null);
}
