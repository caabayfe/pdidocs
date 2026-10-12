var currentUser = gs.getUser();
answer = false;
var businessAppGr = new GlideRecord('cmdb_ci_business_app');
businessAppGr.query();
while (businessAppGr.next()) {
    if (businessAppGr.getValue('it_application_owner') == currentUser) {
        answer = true;
        break;
    }
}
