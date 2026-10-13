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
    const notifyConfUtils = imports["sn_uib_notify.NotifyConferenceUxfClientUtil"]();
    
    /**
     * Custom payload resolver method.
     * Allowed types are UX_BINDING and JSNO_LITERAL
     */
    const buildUXPayload = (payloadDefinition, data) => {
        if (!payloadDefinition || !data) return;
        const result = {};
        for (const key in payloadDefinition) {
            const payloadDef = payloadDefinition[key];
            switch (payloadDef.type) {
                case "UX_BINDING":
                    if (!payloadDef.value) continue;
                    const splitBinding = payloadDef.value.split(notifyConfUtils.META_PAYLOAD_DELIMETER);
                    let resultantPayload = { ...data
                    };
                    for (const index in splitBinding) {
                        const item = splitBinding[index];
                        if (!item) continue;
                        resultantPayload = resultantPayload[item];
                        if (!resultantPayload) continue;
                    }
                    result[key] = resultantPayload;
                    break;
                case "JSON_LITERAL":
                    if (!payloadDef.value) continue;
                    result[key] = payloadDef.value;
                    break;
                default:
                    //Not handled
                    break;
            }
        }
        return result;
    };

    /**
     * Right now Notify accepts two actions, Start and Dropdown actions
     */
    if (event.elementId === 'custom_slot_button') {
        const elementContext = event.context.item.value;
        const actionBinding = elementContext.actionPayloadBinding;
        const data = elementContext.data;
        const resolvedPayload = buildUXPayload(actionBinding, data);
        /**
         * sysId and Table are mandatory for the modal hence the payload should contain them
         */
        if (!resolvedPayload.table || !resolvedPayload.sysId) return;
        /**
         * As start is universal for upcoming we are directly handling open modal
         */
        api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', {
            viewportElementId: 'modal_viewport',
            route: 'notify-conference-dialog-snc',
            fields: {
                table: resolvedPayload.table,
                sysId: resolvedPayload.sysId,
                isParentRecordAware: true,
                type: "startConference",
            },
            params: {
                modalTitle: resolvedPayload.modalTitle || "",
            }
        });
    } else if (event.elementId == "custom_slot_dropdown") {
        const elementContext = event.context.item.value;
        const payload = event.payload.item;
        const data = elementContext.data;
        const actionBinding = payload.payloadBinding;
        const resolvedPayload = buildUXPayload(actionBinding, data);
        /**
         * Emit the custom Notify Event with resolved payload
         */
        api.emit("NOTIFY_CUSTOM_SLOT_DROPDOWN_SELECT", {
            id: payload.id,
            data: { ...resolvedPayload}
        });
    }
}
