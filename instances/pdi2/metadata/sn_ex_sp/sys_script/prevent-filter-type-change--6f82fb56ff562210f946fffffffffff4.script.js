(function executeRule(current, previous /*null when async*/ ) {

    var configGR = new GlideRecord('sn_ex_sp_request_filter_config');
    configGR.addQuery('req_filter_definition', current.sys_id);
    configGR.query();

    if (configGR.hasNext()) {
        gs.addErrorMessage(gs.getMessage("Unable to change filter type because it's currently being used in other filter configurations. Remove it from other configurations and try again."));
        current.setAbortAction(true);
    }

})(current, previous);
