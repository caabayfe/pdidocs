/* @param {params} params
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
    //Following import statement is boiler-plate code for ACE client scripts. Please do not manipulate the next line.
    const aceUtils = imports["sn_ace.ACEClientScriptUtils"](api, helpers);

    const {
        eventName,
        eventPayload
    } = event.payload;

    let {
        blockcontext,
        item,
        context,
        actionItem,
        detail
    } = eventPayload;

    const ADD_UTTR_MODAL = "cc46-11fe-ab988b-0ed1-99ab2bb8";
    const EDIT_UTTR_MODAL = "d9ea-5c01-999b88-25dd-8a893388";
    const DELETE_CONFIRMATION_MODAL = "ca2f-31b5-a8b899-db7d-9999e1b8";

    switch (eventName) {
        case "SAVE_EDIT_UTTR":
            {
                aceUtils.setContext(blockcontext);
                aceUtils.refreshContentBlock('edit_utterance').then(() => {
                    aceUtils.getContext().then(response => {
                        if (response.editUttrAlert.length === 0) {
                            aceUtils.dismissModal();
                        }
                    });
                });
                break;
            }
        case "UTTERANCE_SET":
            {
                blockcontext.addUttrAlertMsg = [];
                blockcontext.utterance = eventPayload.fieldValue;
                aceUtils.setContext(blockcontext);
                break;
            }
        case "ADD_UTTERANCE":
        case "ADD_UTR_ENTER":
            {
                if (!blockcontext.utterance) {
                    blockcontext.addUttrAlertMsg = [{
                        "status": "critical",
                        "content": await helpers.translate("Utterance cannot be empty")
                    }];
                    aceUtils.setContext(blockcontext);
                    return
                }
                blockcontext.addUtteranceMode = "irrelevant";
                aceUtils.setContext(blockcontext);
                aceUtils.openModal(ADD_UTTR_MODAL);
                break;
            }
        case "SET_ADD_UTTR_MODEL":
            {
                const {
                    id,
                    name,
                    label
                } = item;
                blockcontext.addUtteranceSelectedModel.id = id;
                blockcontext.addUtteranceSelectedModel.name = name;
                blockcontext.addUtteranceSelectedModel.label = label;
                aceUtils.setContext(blockcontext);
                break;
            }
        case "SAVE_ADD_UTTR":
            {
                aceUtils.setContext(blockcontext);
                aceUtils.refreshContentBlock('add_utterance').then(() => aceUtils.dismissModal());
                break;
            }
        case 'SAVE_FEEDBACK':
            {
                const refreshedBlock = aceUtils.refreshContentBlock('save_feedback');
                refreshedBlock.then((response) => {
                    aceUtils.refreshContentBlock('fetch_list');
                });
                break;
            }
        case 'CONFIRM_DELETE_UTTR':
            {
                aceUtils.refreshContentBlock('delete_utterance').then(() => aceUtils.refreshContentBlock('update_rows'));
                aceUtils.dismissModal();
                api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                    items: [{
                        id: "alert1",
                        status: "info",
                        icon: "circle-check-outline",
                        content: {
                            type: "html",
                            value: await helpers.translate("Utterance has been deleted.")
                        },
                        action: {
                            type: "dismiss"
                        },
                    }]
                })
                break;
            }
        case "LIST_ACTIONS":
            {

                const {
                    rows
                } = context;
                const {
                    cells
                } = rows[0];
                const copiedMsg = await helpers.translate("This utterance has been copied.");

                switch (actionItem.action) {
                    case "COPY_UTTERANCE":
                        {
                            helpers.writeText(cells.utterance.value).then(() => api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                                items: [{
                                    id: "alert1",
                                    status: "info",
                                    icon: "circle-info-outline",
                                    content: {
                                        type: "html",
                                        value: copiedMsg
                                    },
                                    action: {
                                        type: "dismiss"
                                    },
                                }]
                            }))
                            break;
                        }
                    case "DELETE_UTTERANCE":
                        {
                            blockcontext.deleteSysId = cells.sys_id.value;
                            aceUtils.setContext(blockcontext);
                            aceUtils.openModal(DELETE_CONFIRMATION_MODAL);
                            break;
                        }
                    case "EDIT_UTTERANCE":
                        {
                            blockcontext.editUtterance = cells.utterance.value;
                            blockcontext.editSysId = cells.sys_id.value;
                            aceUtils.setContext(blockcontext);
                            aceUtils.openModal(EDIT_UTTR_MODAL);
                        }
                }
                break;
            }
        case "INTENT_CHANGE":
            {
                const {
                    id: corrected_id
                } = detail.payload.items[0];
                const utteranceId = detail.payload.rowKey;
                if (corrected_id) {
                    blockcontext.feedback.done[utteranceId] = {
                        feedback: "negative",
                        correct_label_reference: corrected_id
                    }
                    if (blockcontext.disableSaveFeedback) {
                        blockcontext.disableSaveFeedback = false;
                    }
                    aceUtils.setContext(blockcontext);
                }
                break;
            }
        case 'UTTERANCE_FILTER':
        case 'UTTERANCE_FILTER_ON_ENTER':
            blockcontext.searchUtterance = eventPayload.value || eventPayload.fieldValue;
            aceUtils.setContext(blockcontext);
            aceUtils.refreshContentBlock('update_rows');
            break;
        case 'MODEL_CHANGE':
            blockcontext.selectedModel = eventPayload.value;
            aceUtils.setContext(blockcontext);
            aceUtils.refreshContentBlock('update_rows');
            break;
        case "PAGE_CHANGE":
            {
                if (blockcontext.offset !== eventPayload.value) {
                    blockcontext.offset = eventPayload.value * blockcontext.pageSize;
                    aceUtils.setContext(blockcontext);
                    aceUtils.refreshContentBlock('update_rows');
                }
                break;
            }
        case "PAGE_SIZE_CHANGE":
            {
                blockcontext.pageSize = eventPayload.value;
                aceUtils.setContext(blockcontext);
                aceUtils.refreshContentBlock('update_rows');
                break;
            }
        case "CLOSE_MODAL":
            {
                aceUtils.dismissModal();
                break;
            }
    }
}
