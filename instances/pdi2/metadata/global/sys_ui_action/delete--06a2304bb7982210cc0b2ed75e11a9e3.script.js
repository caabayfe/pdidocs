var ajaxHelper;
var objSysId;
var tblName;
var dlg;
var returnUrl;
var fromRelList;
var module;
var listQuery;
var stackName = null;
var gotoUrl = null;
var gForm;

function confirmAssociatedMIDs() {
    var gwt = new GwtMessage();
    gForm = g_form;
    var profileId = gForm.getUniqueValue();
    if (!profileId)
        return;

    var ga = new GlideAjax("MIDServerAjax");
    ga.addParam("sysparm_name", 'getMidsfromProfile');
    ga.addParam("sysparm_profile", profileId);
    ga.getXMLWait();
    var midsCount = ga.getAnswer();

    //If any MID server belongs to profile then prompt user to confirm deletion
    if (midsCount > 0) {
        var gm = new GlideModal('glide_confirm_standard');
        gm.setTitle(gwt.getMessage('Warning: MID Server associated to this Profile'));
        var bodymsg = gwt.getMessage("This profile is assigned to: {0} MID server(s). Are you sure you want to delete this record?", midsCount);
        var cncelmsg = gwt.getMessage("cancel");
        var okmsg = gwt.getMessage("Delete MID Profile");
        gm.renderWithContent('\
				<div style="padding:15px"><p>' + bodymsg + '</p>\
					<div style="padding:5px;float:right">\
						<button style="padding:5px;margin-right:10px" \
							onclick="top.window.takeAction(true)" \
							class="btn btn-default">' + okmsg + '</button>\
						<button style="padding:5px" \
							onclick="top.window.takeAction(false)" \
							class="btn btn-primary">' + cncelmsg + '</button>\
					</div> \
				</div>');

        top.window.takeAction = function(deleteRecord) {
            gm.destroy();
            if (deleteRecord) {
                confirmAndDeleteFromForm();
            } else {
                return;
            }
        };
        return false; //prevents the form from submitting when the dialog first loads
    } else {
        confirmAndDeleteFromForm();
    }
}

function confirmAndDeleteFromForm() {
    objSysId = gForm.getUniqueValue();
    tblName = gForm.getTableName();
    fromRelList = gForm.getParameter('sysparm_from_related_list');
    module = gForm.getParameter('sysparm_userpref_module');
    listQuery = gForm.getParameter('sysparm_record_list');
    stackName = gForm.getParameter('sysparm_nameofstack');
    gotoUrl = gForm.getParameter('sysparm_goto_url');

    ajaxHelper = new GlideAjax('DeleteRecordAjax');
    ajaxHelper.addParam('sysparm_name', 'getCascadeDeleteTables');
    ajaxHelper.addParam('sysparm_obj_id', objSysId);
    ajaxHelper.addParam('sysparm_table_name', tblName);
    ajaxHelper.addParam('sysparm_nameofstack', stackName);
    ajaxHelper.setWantSessionMessages(false);
    if (gotoUrl && gotoUrl != "")
        ajaxHelper.addParam('sysparm_goto_url', setRedirectFields(gotoUrl));

    ajaxHelper.getXMLAnswer(getCascadeDelTablesDoneForm.bind(this), null, null);
}

function getCascadeDelTablesDoneForm(answer, s) {

    var ansrArray = answer.split(';');
    returnUrl = ansrArray[0];
    var objList = ansrArray[2];
    var dialogClass = top.window.GlideModal ? GlideModal : GlideDialogWindow;
    dlg = new dialogClass('delete_confirm_form');
    dlg.setTitle(new GwtMessage().getMessage('Confirmation'));
    if (objList == null) {
        dlg.setWidth(275);
    } else {
        dlg.setWidth(450);
    }
    dlg.setPreference('sysparm_obj_id', objSysId);
    dlg.setPreference('sysparm_table_name', tblName);
    dlg.setPreference('sysparm_delobj_list', objList);
    dlg.setPreference('sysparm_parent_form', this);
    dlg.setPreference('focusTrap', true);
    dlg.render();

}

function deleteCompleted() {
    dlg.destroy();
    var w = getTopWindow();
    cbField = w.document.getElementById('glide_dialog_form_target_' + tblName);
    if (cbField != null) {
        // this is a dialog form, make sure the completion callback is called
        cbField.value = 'sysverb_delete:' + objSysId;
        cbField.onchange();

        // dismiss the dialog form
        var elem = window.parent.document.getElementById('body_FormDialog');
        if (elem)
            new GlideWindow().locate(elem).destroy();
    } else {
        // this is a regular form, use the return URL to back to the correct view, where possible
        if (returnUrl != 'null') {
            window.location.href = returnUrl;
        } else {
            // this is just the default case, in case everything else blows up, should never happen!
            window.location.href = window.location.protocol + '//' + window.location.host + '/' + tblName + '_list.do?sysparm_userpref_module=' + module + '&sysparm_query=' + listQuery + '&sysparm_cancelable=true';
        }
    }
}

// this logic is similar to that in RedirectTransaction.setRedirectURL
function setRedirectFields(gotoURL) {
    if (gotoURL.indexOf('$sys_id') > -1)
        gotoURL = gotoURL.replace(/\$sys_id/g, gForm.getUniqueValue());

    if (gotoURL.indexOf('$action') > -1)
        gotoURL = gotoURL.replace(/\$action/g, 'sysverb_delete');

    if (gotoURL.indexOf('$display_value') > -1)
        gotoURL = gotoURL.replace(/\$display_value/g, gForm.getDisplayValue());

    return gotoURL;
}
