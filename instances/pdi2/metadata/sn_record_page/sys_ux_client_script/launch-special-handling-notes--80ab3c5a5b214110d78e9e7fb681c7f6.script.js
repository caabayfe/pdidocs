/**
* @param {params} params
* @param {api} params.api
* @param {event} params.event
* @param {imports} params.imports
* @param {helpers} params.helpers
*/
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

    api.setState('shnContent', SHNOutput);
    if (!api.state.specialHandlingNotesDisplayed || event.name == "CTRL_RECORD#OPEN_SHN_MODAL") {
        if (showModal && api.context.props.screen.isActive) {
            api.emit('RECORD#OPEN_MODAL', {
                route: "shn",
                fields: {
                    table: api.context.props.inputTable,
                    sysId: api.context.props.inputSysId
                },
                params: {},
                "ariaLabel": await helpers.translate("Special handling notes")
            });
            api.setState("specialHandlingNotesDisplayed", true);
            api.setState("SHNModalOpened", true); // We are setting the SHNModalOpened state to true once we open the Modal
        }
    }
}
