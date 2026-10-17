var isCurrentUserResponsible  = current.responsible_users.indexOf(gs.getUserID()) != -1 || previous.responsible_users.indexOf(gs.getUserID()) != -1;
var isCurrentUserAdmin = gs.hasRole('pa_admin') || gs.hasRole('pa_target_admin') || gs.hasRole('pa_power_user');
if (!current.owner && !isCurrentUserAdmin && gs.hasRole('pa_viewer') && !isCurrentUserResponsible )
	current.owner = gs.getUserID();

var paTarget = new SNC.PATarget(current.sys_id);

paTarget.forIndicator(current.getValue('indicator'));
paTarget.withAggregate(current.getValue('aggregate'));
paTarget.withBreakdown(current.getValue('breakdown'));
paTarget.withElement(current.getValue('element'));
paTarget.withBreakdownLevel2(current.getValue('breakdown_level2'));
paTarget.withElementLevel2(current.getValue('element_level2'));
paTarget.withAnyElement(current.any_element);
paTarget.withOwner(current.owner);

if (paTarget.isDuplicate()) {
    var msg = paTarget.getDuplicateMSG();
    gs.addInfoMessage(msg);
    current.setAbortAction(true);
}
