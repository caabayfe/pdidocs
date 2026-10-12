/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    let number = "",
        table = "",
        sysId = "",
        source = "";
    if (event.name == "SN_FORM_DATA_CONNECTED#OPEN_PHONE") {
        number = event.payload.number;
        table = event.payload.table;
        sysId = event.payload.sysid;
        source = "ribbon" + "~" +new Date().getTime();
    } else if (event.name == "RECORD#OPEN_CALL") {
        number = event.payload.params.number;
        table = event.payload.params.table;
        sysId = event.payload.params.sysId;
        source = event.payload.params.source + "~" + new Date().getTime();
    }
    api.emit('VIEWPORT_SELECTED', {
        id: 'cti',
        group: "bottom",
        viewportInfo: {
            route: 'cti',
            fields: {
                opened: true
            },
            params: {
                number,
                table,
                sysId,
                source
            },
            viewportElementId: 'wsOpenframeCTI'
        }
    });
}
