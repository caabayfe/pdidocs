/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
async function handler({api, event, helpers, imports}) {
    if (api.context.props.errorMessage) {
        api.setState('errorState', {
            'label': api.context.props.errorMessage,
            'level': 6
        });
    } else {
        api.setState('errorState', {
            'label': await helpers.translate('This feature is not compatible with your version.'),
            'level': 6
        });
    }

}
