var IpkiMigrationProbeService = Class.create();
IpkiMigrationProbeService.prototype = {

    MIGRATION_TABLE: 'sn_mid_infra_ipki_migration',
    DETAILS_MAX_LENGTH: 255,

    initialize: function() {},

    issueProbeForMigrationRecord: function(migrationGr) {
        var migSysId = migrationGr.getUniqueValue();
        var midSysId = migrationGr.getValue('mid_server');

        gs.info('IpkiMigrationProbeService.issueProbeForMigrationRecord: invoked. migration=' + migSysId);

        if (!migrationGr.ecc_queue_outbound_record.nil()) {
            gs.info('IpkiMigrationProbeService.issueProbeForMigrationRecord: probe already issued. migration=' + migSysId);
            return;
        }

        if (!midSysId) {
            gs.error('IpkiMigrationProbeService.issueProbeForMigrationRecord: no mid_server. migration=' + migSysId);
            var failGr = new GlideRecord(this.MIGRATION_TABLE);
            failGr.addQuery('sys_id', migSysId);
            failGr.setLimit(1);
            failGr.query();
            if (failGr.next()) {
                failGr.setValue('status', 'failed');
                failGr.setValue('details', 'no mid_server set on migration record');
                failGr.setWorkflow(false);
                failGr.update();
            }
            return;
        }

        var outboundSysId;
        try {
            outboundSysId = new sn_mid_infra.IPKIService().createMigrateProbe(midSysId);
        } catch (e) {
            // createMigrateProbe() already records the failure on the migration record via
            // _failMigration before rethrowing, so no applyTransition is needed here.
            gs.error('IpkiMigrationProbeService.issueProbeForMigrationRecord: IPKIService.createMigrateProbe() threw.' +
                     ' migration=' + migSysId + ' error=' + e.message);
            return;
        }

        outboundSysId = typeof outboundSysId === 'string' ? outboundSysId : '';
        if (!outboundSysId) {
            gs.warn('IpkiMigrationProbeService.issueProbeForMigrationRecord: outbound ecc_queue record not found.' +
                    ' migration=' + migSysId);
        }

        var updateGr = new GlideRecord(this.MIGRATION_TABLE);
        updateGr.addQuery('sys_id', migSysId);
        updateGr.setLimit(1);
        updateGr.query();
        if (updateGr.next()) {
            updateGr.setValue('ecc_queue_outbound_record', outboundSysId);
            updateGr.setWorkflow(false);
            updateGr.update();
        }

        var details = ('Migration probe issued; ecc_queue_outbound_record=' + (outboundSysId || '<not found>'))
            .substring(0, this.DETAILS_MAX_LENGTH);
        new IpkiMigrationManager().applyTransition(midSysId, 'registration', details);
    },

    type: 'IpkiMigrationProbeService'
};
