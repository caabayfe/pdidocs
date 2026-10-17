/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    let message;
    if (api.data.role_fetcher.output.row_rule === true) {
        const warning = await helpers.translate('Existing row rules on {0} may override this definition.', api.context.props.table);
        message = warning;
    }

    if (api.data.role_fetcher.output.field_rule === true) {
        const warning = await helpers.translate('Existing field rules on {0}.{1} may override this definition', api.context.props.table, api.context.props.field);
        if (message) {
            message = `${message} ${warning}`;
        } else
            message = warning;
    }

    const alertState = {
        showAlert: api.data.role_fetcher.output.row_rule || api.data.role_fetcher.output.field_rule,
        alertType: 'warning',
        message
    };

    api.setState('alertState', alertState);
}
