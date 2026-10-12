function onSubmit() {
    var ist = import_set_tables_rightzone.getValues();


    if (ist == "") {
        alert("Please select an import set table first");
        return false;
    }
    // set the selected list as a comma seperated string for server side
    var el = gel('import_set_table_list');
    el.value = ist;

    var ret = checkScope(ist);
    if (!ret)
        return false;

}

function checkScope(ist) {
    var curAppId = gel('cur_app_id').value;
    var curAppName = gel('cur_app_name').value;

    var tbs = ist.toString().split(',');
    var scopedTbs = [];

    for (var idx = 0; idx < tbs.length; idx++) {
        var gr = new GlideRecord('sys_db_object');
        gr.addQuery('name', tbs[idx]);
        gr.query();
        gr.next();

        var curTableScope = gr.sys_scope;
        if (curAppId != curTableScope && gel('ni.maps').value) {
            scopedTbs.push(tbs[idx]);
        }
    }

    if (scopedTbs.length > 0) {
        gel('scope_msg').style.display = "";
        var message = "The import set selected, <strong>" + scopedTbs + "</strong>, for cleanup doesn't belong to $[SP]<a href=sys_scope.do?sys_id=" + curAppId + "><strong>" + curAppName + "</strong> application</a>. Transform maps cannot be deleted.";

        gel('scope_msg_text').innerHTML = message;
        return false;
    }
    return true;
}
