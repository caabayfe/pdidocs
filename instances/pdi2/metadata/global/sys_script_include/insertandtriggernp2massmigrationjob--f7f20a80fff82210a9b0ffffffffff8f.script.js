var InsertAndTriggerNP2MassMigrationJob = Class.create();
InsertAndTriggerNP2MassMigrationJob.prototype = {
    initialize: function() {

        var jobName = "3DES Data for tables with String fields Mass Migration Job";
        var jobType = "nonpassword2_data_migration";
        var logSource = "3DES Data for tables with String fields";

        var np2JobGR = new GlideRecord("sys_mass_encryption_job");
        np2JobGR.addQuery('name', jobName);
        np2JobGR.addQuery('type', jobType);
        np2JobGR.addEncodedQuery("stateNOT INdone,cancelling,cancelled,error");
        np2JobGR.query();
        if (np2JobGR.getRowCount() > 0) {
            gs.log("A non password2 migration job already exists.", logSource);
            return;
        } else {
            var gdt = new GlideDateTime();
            var gtStart = new GlideTime();
            var gtEnd = new GlideTime(gdt.getNumericValue() + 43200000); // 12 hours window
            var massMigrationGR = new GlideRecord("sys_mass_encryption_job");
            massMigrationGR.setValue("name", jobName);
            massMigrationGR.setValue("type", jobType);
            massMigrationGR.setValue("window_start", gtStart);
            massMigrationGR.setValue("window_end", gtEnd);
            massMigrationGR.insert();
            new SNC.MassEncryptionJob().start(massMigrationGR);
        }
    },

    type: 'InsertAndTriggerNP2MassMigrationJob'
};
