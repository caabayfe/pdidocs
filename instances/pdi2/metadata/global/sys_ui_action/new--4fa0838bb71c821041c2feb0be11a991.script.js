(function(action) {
    var uri = action.getGlideURI();
    uri.deleteParmameter('sysparm_referring_url');
    uri.deleteMatchingParameter('sysparm_list_');
    uri.deleteMatchingParameter('sysparm_record_');
    uri.deleteParmameter('sys_is_list');
    uri.deleteParmameter('sys_is_related_list');
    uri.deleteParmameter('sys_submitted');
    uri.deleteParmameter('sysparm_checked_items');
    uri.deleteParmameter('sysparm_ref_list_query');
    uri.deleteParmameter('sysparm_current_row');
    uri.deleteMatchingParameter('fancy.');
    uri.deleteMatchingParameter('sys_rownum');
    uri.deleteMatchingParameter('sysparm_encoded');
    uri.deleteMatchingParameter('sysparm_query_encoded');
    uri.deleteParmameter('sysparm_refer');

    uri.set('sysparm_referring_url', uri.toString());

    var problemSysId = uri.get('sysparm_collectionID');
    var stackUrl = uri.get('sysparm_collection') + '.do?sys_id=' + problemSysId;
    uri.set('sysparm_stack', stackUrl);

    var prbGr = new GlideRecordSecure('problem');
    prbGr.get(problemSysId);

    var modelInterceptorSysId = '34d12b0fb79c821041c2feb0be11a997';
    var typeInterceptorSysId = '29f12894534823004247ddeeff7b1222';
    var interceptorUsed;

    if (!prbGr.isValidRecord()) {
        var isModelActive = gs.getProperty('com.snc.problem_management.models.enabled') === 'true';
        interceptorUsed = isModelActive ? modelInterceptorSysId : typeInterceptorSysId;
    } else
        interceptorUsed = gs.nil(prbGr.getValue('prb_model')) ? typeInterceptorSysId : modelInterceptorSysId;

    var redirect;

    if (!isValidWizard(interceptorUsed)) {
        var path = uri.getFileFromPath() + '';
        path = path.substring(0, path.length - 5) + '.do';
        uri.set('sys_id', '-1');
        redirect = uri.toString(path);
    } else {
        var wizardURL = 'wizard_view.do?sys_target=&sysparm_wizardAction=sysverb_new&sysparm_parent=' + interceptorUsed;
        var referrer = uri.toString('');
        redirect = wizardURL + (referrer ? '&' + referrer.substring(1) : '');
    }
    action.setRedirectURL(redirect);

    function isValidWizard(interceptorID) {
        var wizGr = new GlideRecord('sys_wizard_answer');
        wizGr.addQuery("question", interceptorID);
        wizGr.addActiveQuery();
        wizGr.query();
        return wizGr.hasNext();
    }

})(action);
