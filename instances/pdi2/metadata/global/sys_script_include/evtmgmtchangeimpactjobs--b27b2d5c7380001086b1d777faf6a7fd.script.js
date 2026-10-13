var EvtMgmtChangeImpactJobs = Class.create();
EvtMgmtChangeImpactJobs.prototype = {
    initialize: function() {

        this.JOB_NAME = 'Event Management  - Impact Calculator for BS';
    },

    handleChangeOfImpactJobs: function(newNumberOfJobs) {

        if (newNumberOfJobs < 1 || newNumberOfJobs > 8) {
            gs.error(gs.getMessage("EvtMgmt Impact Jobs: The number of defined jobs has to be between 1 to 8"));
            return;
        }

        if (new EvtMgmtCommons().isImpactCalculationEnabled()) {
            gs.error(gs.getMessage("EvtMgmt Impact Jobs: The number of jobs can't change when Impact Calculation Is Enable."));
            return;
        }

        gs.info(gs.getMessage("EvtMgmt Impact Jobs: Tring to update {0} jobs.", newNumberOfJobs));

        var minimalImpactBatch = this.getMinimalBatchForCurrentJobs();
        var minimalImpactTime = this.getMinimalTimeForCurrentJobs();


        gs.info(gs.getMessage("EvtMgmt Impact Jobs: Tring to update impact hashes to minimalImpactBatch: {0} and minimalImpactTime: {1}.", minimalImpactBatch, minimalImpactTime));

        this.updateHashForJobs(newNumberOfJobs, minimalImpactBatch, minimalImpactTime);

        gs.info(gs.getMessage("EvtMgmt Impact Jobs: Updating bucket for BS and Impact graph."));
        this.changeBucketForBSAndImpactGraph(newNumberOfJobs);

        gs.info(gs.getMessage("EvtMgmt Impact Jobs: Creating new impact jobs."));
        this.updateImpactJobs(newNumberOfJobs);

        gs.info(gs.getMessage("EvtMgmt Impact Jobs: Enabling impact calculation."));
        this.enableImpactCalculation();
    },

    enableImpactCalculation: function() {
        new EvtMgmtCommons().setHashGr('impact_calculation_enable', true);
    },

    updateImpactJobs: function(newNumberOfJobs) {

        this.deleteOldJobs();
        this.createNewJobs(newNumberOfJobs);

    },

    deleteOldJobs: function() {

        var scheduledJobsGR = new GlideRecord('sysauto_script');

        scheduledJobsGR.addQuery('name', 'STARTSWITH', this.JOB_NAME);
        scheduledJobsGR.query();

        scheduledJobsGR.deleteMultiple();
    },

    createNewJobs: function(newNumberOfJobs) {
        //insert new jobs
        var runPeriod = new GlideDateTime("01-01-1970 00:00:05"); //add to var

        var scheduledJobsGR = new GlideRecord('sysauto_script');

        for (var jobNumber = 0; jobNumber < newNumberOfJobs; jobNumber++) {
            scheduledJobsGR.initialize();
            scheduledJobsGR.name = this.JOB_NAME + "_" + jobNumber;
            scheduledJobsGR.run_type = "periodically";
            scheduledJobsGR.run_period = runPeriod;
            scheduledJobsGR.active = true;
            scheduledJobsGR.script = 'var impactManager = new SNC.ImpactManager(); \nimpactManager.runImpactCalculation(' + jobNumber + ');';
            scheduledJobsGR.insert();
        }
    },

    updateHashForJobs: function(newNumberOfJobs, minimalImpactBatch, minimalImpactTime) {
        this.deleteOldHashOfJobs();
        this.createNewHashForJobs(newNumberOfJobs, minimalImpactBatch, minimalImpactTime);
    },

    deleteOldHashOfJobs: function() {
        var saHash = new GlideRecord('sa_hash');

        var batchOrTimeHashes = saHash.addQuery('name', 'STARTSWITH', 'last_impact_time_calc_job');
        batchOrTimeHashes.addOrCondition('name', 'STARTSWITH', 'last_impact_batch_calc_job');
        saHash.addQuery('name', '!=', 'last_impact_time_calc_job_service_groups');
        saHash.query();

        saHash.deleteMultiple();
    },

    createNewHashForJobs: function(newNumberOfJobs, minimalImpactBatch, minimalImpactTime) {

        var saHash = new GlideRecord('sa_hash');
        var jobCalcNamePrefix = 'last_impact_batch_calc_job';
        var jobTimeNamePrefix = 'last_impact_time_calc_job';
        var jobNumber = -2; // add hash for alert group

        do {
            //last_impact_batch_calc_job
            saHash.initialize();
            saHash.name = jobCalcNamePrefix + jobNumber;
            saHash.hash = minimalImpactBatch;
            saHash.insert();

            //last_impact_time_calc_job
            saHash.initialize();
            saHash.name = jobTimeNamePrefix + jobNumber;
            saHash.hash = minimalImpactTime;
            saHash.insert();

            if (jobNumber == -2) { //move jobNumber to -1 so it will insert hashes from 0.
                jobNumber++;
            }
            jobNumber++;

        } while (jobNumber < newNumberOfJobs);

    },

    changeBucketForBSAndImpactGraph: function(newNumberOfJobs) {

        var isUpdateSuccessfully = this.updateBucketProperty(newNumberOfJobs);
        if (isUpdateSuccessfully) {
            var newBucketNumberToSysIds = this.calculteBucketForBS();
			new EvtMgmtCommons().updateBucketForBSAndImpactGraph(newBucketNumberToSysIds);
        }
    },

    updateBucketProperty: function(newNumberOfJobs) {

        var isUpdateSuccessfully = false;
        var jobCountProperty = 'evt_mgmt.impact.bucket_count';
        var sysProperties = new GlideRecord('sys_properties');

        sysProperties.addQuery('name', jobCountProperty);
        sysProperties.query();
        if (sysProperties.next()) {
            sysProperties.value = newNumberOfJobs;
            isUpdateSuccessfully = sysProperties.update() != "";
        } else {
            sysProperties.initialize();
            sysProperties.name = jobCountProperty;
            sysProperties.value = newNumberOfJobs;
            sysProperties.type = 'integer';
            isUpdateSuccessfully = sysProperties.insert() != "";
        }
        return isUpdateSuccessfully;
    },

    calculteBucketForBS: function() {

        var bucketToSysIds = {};
        var bucketCalculator = new EmBucketCalculator();
        var gr = new GlideRecord("cmdb_ci_service_auto");
        gr.query();
        //iterate by services and calculate bucket
        while (gr.next()) {
            var bucket = bucketCalculator.calculateBucket(gr);
            var sysId = gr.getUniqueValue();
            var sysIds = [];
            if (bucketToSysIds[bucket]) {
                sysIds = bucketToSysIds[bucket];
            }
            sysIds.push(sysId);
            bucketToSysIds[bucket] = sysIds;
        }

        return bucketToSysIds;
    },

    getMinimalBatchForCurrentJobs: function() {
        var impactJobBatchesGR = this.getAllImpactJobBatches();

        var minimalImpactBatch = Number.MAX_VALUE;

        while (impactJobBatchesGR.next()) {
            gs.log(impactJobBatchesGR.name + ' ' + impactJobBatchesGR.hash);

            var currentBatch = Number(impactJobBatchesGR.hash);

            if (minimalImpactBatch > currentBatch) {
                minimalImpactBatch = currentBatch;
            }
        }

        gs.log('minimal batch ' + minimalImpactBatch);
        return minimalImpactBatch;

    },

    getAllImpactJobBatches: function() {

        var saHash = new GlideRecord('sa_hash');
        saHash.addQuery('name', 'STARTSWITH', 'last_impact_batch_calc_job');
        saHash.query();

        return saHash;
    },

    getMinimalTimeForCurrentJobs: function() {
        var impactJobTimes = this.getAllImpactJobTimes();
        var minimalImpactTime = new GlideDateTime();

        while (impactJobTimes.next()) {
            var currentTime = new GlideDateTime(impactJobTimes.hash);

            gs.log(impactJobTimes.name + ' ' + impactJobTimes.hash);
            if (minimalImpactTime.compareTo(currentTime) > 0) {
                minimalImpactTime = currentTime;
            }
        }
        gs.log('minimal time ' + minimalImpactTime);

        return minimalImpactTime;
    },

    getAllImpactJobTimes: function() {

        var saHash = new GlideRecord('sa_hash');
        saHash.addQuery('name', 'STARTSWITH', 'last_impact_time_calc_job');
        saHash.addQuery('name', '!=', 'last_impact_time_calc_job_service_groups');
        saHash.query();

        return saHash;
    },

    type: 'EvtMgmtChangeImpactJobs'
};
