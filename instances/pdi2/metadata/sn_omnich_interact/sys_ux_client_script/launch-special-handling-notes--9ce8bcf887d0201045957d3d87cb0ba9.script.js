function handler({
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
    var gFormData = api.data.gform.nowRecordFormBlob;

    if (api.state.specialHandlingNotesDisplayed)    return;

    if (showModal && gFormData && api.context.props.screen.isActive) {
        api.emit('RECORD#OPEN_MODAL', {
            "route": "shn",
            "fields": {
                "confs": SHNOutput,
                "table": gFormData.table,
                "sysId": gFormData.sysId
            }
        });
        api.setState("specialHandlingNotesDisplayed", true);
    }
}
