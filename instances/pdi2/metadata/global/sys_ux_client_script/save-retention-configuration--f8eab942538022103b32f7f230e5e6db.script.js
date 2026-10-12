/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var show_select = api.state.showSelect;
    if (show_select === "" && api.data.record_5.sysId) {
        api.data.delete_record_1.execute({
            table: "sys_audit_retention",
            recordId: api.data.record_5.sysId
        });
    } else if (show_select == "SHOWSELECT" || show_select == "NOSHOW") {
        if (!api.data.record_5.sysId) {
            if (api.state.currChoice !== "Forever" && api.state.currChoice != undefined && api.state.currChoice != '') {
                api.data.create_record_1.execute({
                    table: "sys_audit_retention",
                    templateFields: "tablename=" + api.context.props.table +
                        "^audit_retention=" + api.state.currChoice,
                    useSetDisplayValue: false
                });
            }
        } else {
            if (api.state.currChoice != "Forever" && api.state.currChoice != '' && api.state.currChoice != undefined) {
                api.data.update_record_2.execute({
                    table: "sys_audit_retention",
                    recordId: api.data.record_5.sys_id,
                    templateFields: "audit_retention=" + api.state.currChoice,
                    useSetDisplayValue: false
                });
            }
        }
    }
}
