function transform() {

    var rolesFromProperty = gs.getProperty('nextui_calendar.user.role', 'itil_admin,schedule_admin,admin');

    return gs.hasRole(rolesFromProperty);
}
