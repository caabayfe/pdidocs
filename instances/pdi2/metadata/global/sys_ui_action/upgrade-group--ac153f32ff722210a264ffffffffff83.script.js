gs.include('MigrateToActionGroupM2M');
var migrate = new MigrateToActionGroupM2M();
migrate.migrateActions(current);
action.setRedirectURL(current);
