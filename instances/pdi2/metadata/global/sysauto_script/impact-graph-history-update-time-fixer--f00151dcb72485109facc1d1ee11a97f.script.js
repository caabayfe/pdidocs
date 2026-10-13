var igh_cleaner = new global.FixImpactGraphHistoryUpdateTime();
var daysToVerify = gs.getProperty("evt_mgmt_impact_graph_history_days_to_verify","30");
// Check that we avoid deleting the last BS's entry in em_impact_graph_history table
// and keep at least one valid record
igh_cleaner.checkDates(daysToVerify);
