function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        fetch_ui_policies
    } = api.data;
    const output = fetch_ui_policies?.output || {};
    const value = output.result || {};
    const hasAiGeneratedRecords = output.hasAiGeneratedRecords || false;

    api.emit("SN_CATALOG_FORM_MACRO_VARIABLE#VALUE_CHANGED", {
        value: (api.state.listCount + 1).toString(),
        additionalProps: {
            resetAIInferred: !hasAiGeneratedRecords
        }
    });
}
