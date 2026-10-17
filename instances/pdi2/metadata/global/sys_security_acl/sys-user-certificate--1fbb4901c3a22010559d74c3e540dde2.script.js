answer = checkUser();

function checkUser() {
    if (gs.hasRole('sso_config_admin') || (gs.getUserID() == current.user)) {
        return true;
    }
    return false;
}
