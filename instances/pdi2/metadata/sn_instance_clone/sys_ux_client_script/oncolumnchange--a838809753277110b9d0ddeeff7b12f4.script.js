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
    debugger;
    const uiConstants = imports["sn_instance_clone.InstanceCloneUIConstants"]();
    const newCols = api.data.list_selector_controller_1.selectedCols;
    var _return_fields = [];
    newCols.forEach((_col) => {
        if (_col.length == 1) {
            _return_fields.push(_col[0].id);
        } else {
            var _dotWalkedCols = [];
            _col.forEach((_subCol) => {
                _dotWalkedCols.push(_subCol.id);
            });
            _return_fields.push(_dotWalkedCols.join("."));
        }
    });

   // Use new selection or fall back to existing
    const fieldsToUse = _return_fields.length > 0
        ? _return_fields.join(",")
        : api.state.return_fields;
    api.setState("return_fields", fieldsToUse);
    
    //api.setState("return_fields", _return_fields.join(","));
    helpers.modal.close('modal_viewport_1');
    
    // ── Save to activity-specific preference key ───────────────────
    const activity = api.state.activity || '';
    const userPref = (activity === 'overview')
        ? 'clone_home_overview_columns'
        : 'clone_home_list_columns';


    helpers.timing.setTimeout(()=>{
        helpers
        .snHttp(uiConstants.SERVER_PATH, {
            method: "POST",
            body: {
                operation: uiConstants.OPERATION.SAVE_USER_PREFERENCE,
                userPref: userPref,
                value: _return_fields.join(",")
            },
        })
        .then((response) => {
            console.log("Prefs saved successfully!!");
        })
        .catch((resp) => {
            if (!!resp.error) {
                try {} catch (e) {}
            }
        });
    },300);
}
