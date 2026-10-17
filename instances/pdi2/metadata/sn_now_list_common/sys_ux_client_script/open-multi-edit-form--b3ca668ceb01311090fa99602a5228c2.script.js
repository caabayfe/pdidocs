/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    const { validateDirtyStatus } = imports['sn_now_list_common.ListControllerUtils']();
    if (validateDirtyStatus(...arguments))
        return;

    const sysIds = api.data.sn_record_list_data_broker.out?.actionBarProps.daModel.sysIds;
    api.emit('LIST_CTRL#OPEN_PANEL', {
        route: 'multi-edit',
        fields: {
            sysIds
        }
    });
    // Set state to track that multi-form is now open
    api.setState('isMultiEditFormOpen', true);
}
