answer = true;
var currentUser = gs.getUser();
var roles = currentUser.getRoles();
if (gs.hasRole('admin')) {
    answer = false;
}
if (roles.indexOf('sn_imt_checkin.checkin_admin') > -1) {
    answer = true;
}
