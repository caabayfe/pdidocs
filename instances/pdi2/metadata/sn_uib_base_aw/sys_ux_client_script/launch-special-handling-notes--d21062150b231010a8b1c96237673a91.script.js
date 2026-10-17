async function handler({
    api,
    helpers,
    event,
    imports
}) {
   const {
    snHttp,
    modal,
    screen
} = helpers;

    var SHNOutput = api.data.get_special_handling_notes.output.data.GlideSHN_Query;
    var showModal = SHNOutput && SHNOutput.totalMsg > 0;

    if (api.state.specialHandlingNotesDisplayed)    return;

    if (showModal && api.context.props.screen.isActive) {
        api.emit('RECORD#OPEN_MODAL', {
            "route": "shn",
            "fields": {
                "confs": SHNOutput,
                "table": api.context.props.table,
                "sysId": api.context.props.sysId
            },
            "ariaLabel": await helpers.translate("Special handling notes")
        });
        api.setState("specialHandlingNotesDisplayed", true);
    }
}
