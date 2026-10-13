// Run the script to sync the alert groups hash entry last_impact_batch_calc_job-2 with last_impact_batch_calc_job0
// in case the gap is higher then property: evt_mgmt.impact.calc_job_gap
var hashSync = new EvtMgmtAlertGroupsImpactCalculatorHashSync();
hashSync.checkAndSync();
var impactManager = new SNC.ImpactManager();
// Alert Groups and SLA job
impactManager.runImpactCalculation(-2);
