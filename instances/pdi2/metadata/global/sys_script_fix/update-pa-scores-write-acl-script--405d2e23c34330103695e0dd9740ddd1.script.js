UpdateWriteACL();

function UpdateWriteACL() {
    if (pm.isZboot())
        return;

    var grCustomerUpdate = new GlideRecord('sys_update_xml');
    if (grCustomerUpdate.get('name', 'sys_security_acl_8663b798bf201100b96dac808c073999')) {
        gs.warn('Write ACL for pa_score_notes with sys_id 8663b798bf201100b96dac808c073999 was not updated on upgrade since it was already customised.');
    } else {
        var gr = new GlideRecord('sys_security_acl');
        gr.addEncodedQuery('sys_id=8663b798bf201100b96dac808c073999^scriptLIKEanswer = new SNC.PADomainUtils().isWriteable("pa_score_notes", current.sys_id);^scriptLIKEif (!gs.hasRole(\'pa_admin\') && !gs.hasRole(\'pa_power_user\') && !gs.hasRole(\'pa_viewer\') && !gs.hasRole(\'pa_contributor\'))^scriptLIKEanswer = answer && (!current.user || gs.getUser().getID() == current.user);');
        gr.query();
        if (!gr.next()) {
            gs.warn('Write ACL for pa_score_notes with sys_id 8663b798bf201100b96dac808c073999 and relevant script was not found in DB. no further action is required.');
        } else {
            var scriptText = 'answer = new SNC.PADomainUtils().isWriteable("pa_score_notes", current.sys_id);' + '\n';
            scriptText += 'if (!gs.hasRole(\'pa_admin\') && !gs.hasRole(\'pa_power_user\') && !gs.hasRole(\'pa_viewer\') && !gs.hasRole(\'pa_contributor\'))' + '\n';
            scriptText += '\tanswer = answer && (gs.getUser().getID() == current.user);';
            gr.setValue('script', scriptText);
            gr.update();
            gs.info('The script for the Write ACL for pa_score_notes with sys_id 8663b798bf201100b96dac808c073999 was updated successfuly');
        }
    }
}
