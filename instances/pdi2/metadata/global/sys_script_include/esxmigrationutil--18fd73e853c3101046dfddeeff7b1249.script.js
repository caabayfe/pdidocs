var ESXMigrationUtil;

(function() {
    var tablesToRetire = ['cmdb_ci_vcenter_datastore', 'cmdb_ci_vcenter_network', 'cmdb_ci_esx_resource_pool'];

    ESXMigrationUtil = {
        retireCIsForESXForwardMigration: retireCIsForESXForwardMigration
    };

    /* This script include will be called to retire all duplicate CIs during esx migration

		auto - forward migration will be triggered automatically during vCenter discovery
		manual - reverse migration will be triggered by an on demand scheduled job

		Given a list of sys_ids of esx server,
		retire all the entities for which server column is equal to given esx server
		@param esx_sys_ids : list of sys_ids of  all esx server for this vCenter
    */

    function retireCIsForESXForwardMigration(esx_sys_ids, logger) {
        var invalidSysIds = [];
        var esxForMigration = [];

        esx_sys_ids.forEach(function(sysid) {
            var gr = new GlideRecord('cmdb_ci_esx_server');
            gr.addQuery('sys_id', sysid);
            gr.query();
            if (!gr.next())
                invalidSysIds.push(sysid);
            else {
                var vmGR = new GlideRecord('cmdb_ci_vm_object');
                vmGR.addQuery('server', sysid);
                vmGR.addQuery('install_status', 1);
                vmGR.setLimit(1);
                vmGR.query();
                if (vmGR.next()) {
                    esxForMigration.push(sysid); // stand alone esx server is migrated to vCenter
                }
            }
        });

        if (invalidSysIds.length > 0) {
            if (logger)
                logger.error("ESXi to vCenter migration script aborted. Following sys_ids are invalid for esx server " + invalidSysIds + " Please provide correct sys_ids");
            else
                gs.error("ESXi to vCenter migration script aborted. Following sys_ids are invalid for esx server " + invalidSysIds + " Please provide correct sys_ids");
            return;
        }
		if(esxForMigration.length > 0){
			if (logger)
				logger.info(gs.getMessage("Triggering migration script for esx server {0}", esxForMigration.toString()));
			tablesToRetire.forEach(function(table) {
				if (table == 'cmdb_ci_vcenter_datastore') {
					// fetch all installed datastores
					var dsGR = new GlideRecord('cmdb_ci_vcenter_datastore');
					dsGR.addQuery('server', 'IN', esxForMigration);
					dsGR.addQuery('install_status', 1);
					dsGR.query();
					// retire all related cmdb_ci_vcenter_datastore_disk for the datastore
					while (dsGR.next()) {
						var dskGR = new GlideRecord('cmdb_ci_vcenter_datastore_disk');
						dskGR.addQuery('datastore', dsGR.getValue('sys_id'));
						dskGR.addQuery('install_status', 1);
						dskGR.setValue('install_status', 7);
						dskGR.updateMultiple();
					}
				}
				/* Server column referring to an ESX server implies that this record was created by standalone ESX discovery,
			   so it is updated as retired.
			   install_status '7' = retired, '1' = installed
			*/
				var gr = new GlideRecord(table);
				gr.addQuery('server', 'IN', esxForMigration);
				gr.addQuery('install_status', 1);
				gr.setValue('install_status', 7);
				gr.updateMultiple();
			});
		}
    }
})();
