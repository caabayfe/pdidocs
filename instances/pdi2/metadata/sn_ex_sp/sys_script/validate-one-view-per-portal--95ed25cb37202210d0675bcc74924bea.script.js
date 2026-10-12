(function executeRule(current, previous /*null when async*/ ) {
    if (current.active == false) {
        return;
    }
    var filterDefGR = new GlideAggregate('sn_ex_sp_request_filter_definition');
    filterDefGR.addQuery('active', true);
    if (!current.all_portals) {
        var portals = current.portals.split(',');
        filterDefGR.addQuery('portals', 'IN', portals).addOrCondition('all_portals',true);
    }
    filterDefGR.addQuery('sys_id', '!=', current.sys_id);
    filterDefGR.addQuery('render_as_view', true);
    filterDefGR.addAggregate('COUNT');
    filterDefGR.query();
    if (filterDefGR.next()) {
        var count = filterDefGR.getAggregate('COUNT');
        if (count > 0) {
            gs.addErrorMessage(gs.getMessage("A view configuration already exists for this portal. Only one view is allowed per portal."));
            current.setAbortAction(true); // Abort action to prevent further processing
        }
    }


})(current, previous);
