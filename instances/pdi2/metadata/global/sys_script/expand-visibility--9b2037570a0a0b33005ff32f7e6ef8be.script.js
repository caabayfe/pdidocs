gs.include("DomainManager");

var dm = new DomainManager();
if (sys_action == 'update') {
    // should never happen
} else if (sys_action == 'delete') {
    dm.deleteDomain(current);
} else if (sys_action == 'insert') {
    dm.expandDomain(current);
}
