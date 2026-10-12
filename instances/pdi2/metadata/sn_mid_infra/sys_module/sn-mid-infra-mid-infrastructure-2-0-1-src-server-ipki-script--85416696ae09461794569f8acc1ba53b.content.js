/* eslint-disable no-restricted-globals */
(function() {
    gs.info('ipki_certificate_activation_migration_listener: invoked. parm1=' + event.parm1);
    new IpkiMigrationManager().handleActivation(event.parm1, event.parm2);
})();
