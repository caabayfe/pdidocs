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
    const {
        status,
        screenParams
    } = event.payload;
    const {
        table,
        aceAppConfigId
    } = api.context.props;

    const {
        form
    } = api.data.record;

    switch (status) {
        case 'inserted':
            {
                if (table === 'sn_ace_page') {
                    api.setState('templateCloneData', {
                        experienceId: aceAppConfigId,
                        templateId: form.fields.template.value,
                        pageName: form.fields.name.value,
                        pageRoute: form.fields.path.value,
                        acePageId: screenParams.sysId,
                        isNewPage: api.data.record.isNew
                    });
                    api.setState('sysId', screenParams.sysId);
                    return;
                }
                api.emit('NAV_ITEM_SELECTED', {
                    route: 'record',
                    fields: {
                        aceAppConfigId: aceAppConfigId,
                        table: screenParams && screenParams.table,
                        sysId: screenParams && screenParams.sysId
                    }
                });
                break;
            }

        case 'closed':
            {
                const uxAppRouteId = api.data.record.form.fields.route.value;
                api.data.get_details_for_page_deletion_1.execute({
                    uxAppRouteId
                });
                break;
            }
    }
}
