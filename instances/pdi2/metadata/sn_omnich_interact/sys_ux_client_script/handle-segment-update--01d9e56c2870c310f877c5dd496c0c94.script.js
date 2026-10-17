/**
 * Handles real-time updates to the wrap-up segment record.
 *
 * When the segment's wrap_up_configuration reference changes mid-wrap-up,
 * propagates the new configuration sys_id to state and emits
 * WRAP_UP#CONFIG_UPDATED so the timer can refresh.
 *
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 */
function handler({ api, event }) {
    if (!event?.payload?.data) { return; }

    const record = event.payload.data.record;
    const changes = event.payload.data.changes;
    if (!changes || !changes.includes("wrap_up_configuration")) { return; }

    const newWrapUpConfigSysId = record?.wrap_up_configuration?.value;
    if (newWrapUpConfigSysId == null) { return; }

    api.setState("wrapUpConfigSysId", newWrapUpConfigSysId);
}
