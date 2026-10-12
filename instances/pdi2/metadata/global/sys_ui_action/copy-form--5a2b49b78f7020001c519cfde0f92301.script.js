doFormCopy();

function doFormCopy() {
    if (!current.view.changes()) {
        gs.addErrorMessage(gs.getMessage("Please specify the new view you would like to use for the copy of this form"));
        current.setAbortAction();
        action.setRedirectURL(current);
        return;
    }

	var um = new GlideUpdateManager2();
    var scm2m = new GlideRecord("sys_ui_form_section");
    scm2m.addQuery("sys_ui_form", current.sys_id);
    scm2m.query();
    var nf_id = current.setNewGuid();
    while (scm2m.next()) {
        scm2m.sys_ui_form = nf_id;
        var nsc_id = copySection(scm2m.sys_ui_section, current.view);
        if (!nsc_id)
            continue;

        scm2m.sys_ui_section = nsc_id;
        scm2m.insert();
    }

    //insert the sys_ui_form record at the end so the update XML has the correct payload and only 1 version is created
    current.insert();
    action.setRedirectURL(current);

    function copySection(id, view) {
        var sc = new GlideRecord("sys_ui_section");
        sc.get(id);
        var el = new GlideRecord("sys_ui_element");
        el.addQuery("sys_ui_section", sc.sys_id.toString());
        sc.view = view;
        var nsc_id = sc.insert();
        el.query();
        while (el.next()) {
            el.sys_ui_section = nsc_id;
            el.insert();
        }

        um.saveRecord(sc);
        return nsc_id;
    }
}
