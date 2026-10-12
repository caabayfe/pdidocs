async function script({ api, event, helpers, imports }) {
    const { getFormViewStateLabel } = imports["sn_cmdb_ws.DataManagerStateUtil"]();
    await getFormViewStateLabel(api, helpers);
    const pageLoadedMessage = await helpers.translate("Data Manager policy form loaded.");
    helpers.timing.setTimeout(() => {
        api.setState("srMessage", pageLoadedMessage);
    }, 1000);
}
