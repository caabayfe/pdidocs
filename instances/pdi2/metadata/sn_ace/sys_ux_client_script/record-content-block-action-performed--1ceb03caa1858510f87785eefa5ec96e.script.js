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
    const FORM_DATA_FETCH_SUCCESS_STATUS_UPDATED = 'SN_FORM_DATA_CONNECTED#FETCH_STATUS_UPDATED';
    const FORM_DATA_FETCH_SUCCESS = 'SN_FORM_DATA_CONNECTED#FETCH_SUCCESS';
    const FORM_PREVIEW_RECORD = 'SN_FORM_DATA_CONNECTED#PREVIEW_RECORD';
    const RELATED_LIST_NEW_BUTTON_CLICKED = 'RELATED_LIST_NEW_BUTTON_CLICKED';
    const FORM_WRAPPED_ACTION = 'SN_FORM_DATA_CONNECTED#WRAPPED_ACTION';
    const FORM_NAV_ITEM_SELECTED = 'RECORD#NAV_ITEM_SELECTED';
    const {
        payload: {
            eventName,
            eventPayload
        }
    } = event;
    const {
        aceAppConfigId,
        sysId
    } = api.context.props;
    switch (eventName) {
        case FORM_DATA_FETCH_SUCCESS:
            {
                const {
                    nowRecordFormBlob
                } = eventPayload;
                api.setState('formData', nowRecordFormBlob);
                if (nowRecordFormBlob && nowRecordFormBlob.isNewRecord) {
                    api.setState('isNewRecord', nowRecordFormBlob.isNewRecord);
                }
                break;
            }
        case FORM_DATA_FETCH_SUCCESS_STATUS_UPDATED:
            {
                const nowRecordFormBlob = eventPayload.nowRecordFormBlob;
                api.setState('formData', nowRecordFormBlob);
                const {
                    isNewRecord
                } = api.state;
                if (isNewRecord) {
                    if (sysId === '-1') {
                        if (nowRecordFormBlob && nowRecordFormBlob.isNewRecord) {
                            break;
                        }
                    } else if (nowRecordFormBlob && nowRecordFormBlob.sysId) {
                        const {
                            table,
                            sysId
                        } = nowRecordFormBlob;
                        if (table === 'sn_ace_page') {
                            // different flow to create page artifacts.
                            const {
                                aceConstants
                            } = api.state;
                            const {
                                fields
                            } = nowRecordFormBlob.detailsProps;
                            const {
                                template,
                                name,
                                path
                            } = fields;
                            api.setState('templateCloneData', {
                                experienceId: aceAppConfigId,
                                templateId: template.referenceSysId,
                                pageName: name.value,
                                pageRoute: path.value,
                                acePageId: sysId,
                                isNewPage: api.state.isNewPage
                            });
                            api.setState('recordTable', table);
                            api.setState('sysId', sysId);
                        } else {
                            api.emit('NAV_ITEM_SELECTED', {
                                route: 'ace-record-page',
                                fields: {
                                    aceAppConfigId,
                                    table: nowRecordFormBlob.table,
                                    sysId: nowRecordFormBlob.sysId
                                }
                            });
                        }
                    }
                }
                // If ace page was deleted, then delete the UIB page artifacts too.
                // nowRecordFormBlob.isValidRecord is false for deleted records.
                if (api.context.props.table === 'sn_ace_page') {
                    if (nowRecordFormBlob && !nowRecordFormBlob.isValidRecord) {
                        const {
                            formData
                        } = api.state;
                        api.data.get_details_for_page_deletion.execute({
                            uxAppRouteId: formData.detailsProps.fields.route.value
                        });
                    }
                }
                break;
            }

        case FORM_PREVIEW_RECORD:
            {
                api.emit('NAV_ITEM_SELECTED', {
                    route: 'ace-record-page',
                    fields: {
                        aceAppConfigId,
                        table: eventPayload.table,
                        sysId: eventPayload.sys_id
                    }
                });
                break;
            }

        case RELATED_LIST_NEW_BUTTON_CLICKED:
            {
                api.emit('NAV_ITEM_SELECTED', {
                    route: 'ace-record-page',
                    fields: {
                        aceAppConfigId,
                        table: eventPayload.fields.table,
                        sysId: eventPayload.fields.sysId
                    },
                    params: {
                        query: eventPayload.params.query
                    }
                });
                break;
            }

        case FORM_WRAPPED_ACTION:
            {
                const {
                    wrapped_action_name,
                    wrapped_payload
                } = eventPayload;

                switch (wrapped_action_name) {
                    case 'REFERENCE_INFO_CLICK':
                        {
                            api.emit('NAV_ITEM_SELECTED', {
                                route: 'ace-record-page',
                                fields: {
                                    aceAppConfigId,
                                    table: wrapped_payload.referenceInfoClick.referencetable,
                                    sysId: wrapped_payload.referenceInfoClick.sys_id
                                }
                            });
                            break;
                        }
                }
                break;
            }

        case FORM_NAV_ITEM_SELECTED:
            {
                const {
                    elementId,
                    nowRecordFormBlob
                } = eventPayload;
                const {
                    table,
                    sysId
                } = eventPayload.fields;

                api.setState('formData', nowRecordFormBlob);
                if (sysId === '-1' && table === 'sn_ace_content_block') {
                    helpers.modal.open('custom_1');
                    api.setState('newRecordQuery', eventPayload.params.query);
                } else {
                    const additionalParams = {};
                    if (sysId === '-1' && table === 'help_guidance' && api.data.embedded_help_fields.output) {
                        const {appRoute, pageName, pagePath} = api.data.embedded_help_fields.output;
                        additionalParams.query = `type=embedded_help^name=${pageName}^app_route=now/${appRoute}^status=published^context=${pagePath}`;
                    }
                    api.emit('NAV_ITEM_SELECTED', {
                        route: 'ace-record-page',
                        fields: {
                            aceAppConfigId,
                            table: eventPayload.fields.table,
                            sysId: eventPayload.fields.sysId
                        },
                        params: {
                            ...eventPayload.params, ...additionalParams
                        }
                    });
                }
            }
    }
}
