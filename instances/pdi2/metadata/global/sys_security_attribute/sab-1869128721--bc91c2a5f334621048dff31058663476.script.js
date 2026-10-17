answer = false;
var currentUser = gs.getUser();
var roles = currentUser.getRoles();
if (roles.indexOf('sn_imt_travel.admin') > -1 || roles.indexOf('sn_imt_travel.approver') > -1) {
    answer = true;
}
