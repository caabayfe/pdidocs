var profile = sn_mif.MIFBase.getKaaProfile();
var correlationId = gs.generateGUID();

sn_mif.MIFLogContext.executeWithContext(profile.instanceId, profile.customer, correlationId, () => {
    if (MIFBase.isJobEligibleToRun("MIF Sync Down Job: ", profile))
        MIFRetryManager.runSyncDown(correlationId);
});
