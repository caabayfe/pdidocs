/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        existingDefForTable
    } = api.state;
    const { sysId } = api.context.props;

    if (!existingDefForTable)
        return;

    helpers.navigate.to(
        'retirement-definition',
        { sysId: existingDefForTable },
        '',
        '',
        false,
        ''
    );

    // Reset form
    if (sysId == -1) {
        api.setState('defActive', false);
        api.setState('cbTableName', '');
        api.setState('encodedQuery', null);
        api.setState('existingDefForTable', null);
        api.setState('validQuery', null);
    }
}
