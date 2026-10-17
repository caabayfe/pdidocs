            
        // Retrieve retention days from system property, defaulting to 5 if not set
        var retentionDays = gs.getProperty('glide.ui.sys_ux_my_list.auto_deletion_threshold_days', 5);

        // Calculate cutoff date by subtracting retention days from current date
        var cutoffDate = new GlideDateTime();
        cutoffDate.addDaysUTC(-retentionDays); // Records older than this date will be deleted

        // Create a GlideRecord query to find records that match the deletion criteria
        var gr = new GlideRecord('sys_ux_my_list');
        gr.addQuery('opened_by_link', true);
        gr.addQuery('sys_created_on', '<', cutoffDate); // Only records older than cutoffDate
        gr.query();

        // Check if any records exist and delete them in a batch
        if (gr.hasNext()) {
            gs.info('Deleting records older than ' + retentionDays + ' days from sys_ux_my_list...');
            gr.deleteMultiple();
            gs.info('Records deleted successfully.');
        } else {
            gs.info('No records to delete.');
			}
