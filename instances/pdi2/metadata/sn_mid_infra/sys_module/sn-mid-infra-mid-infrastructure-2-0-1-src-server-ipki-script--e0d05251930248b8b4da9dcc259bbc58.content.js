/* eslint-disable no-restricted-globals */
(function() {
    gs.info('sign_csr_migration_listener: invoked. parm1=' + event.parm1);
    new IpkiMigrationManager().handleSignCsr(event.parm1, event.parm2);
})();
