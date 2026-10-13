var EmAiCalculateRelatedTasks = Class.create();
var emAiInsightCommon = new EmAiInsightCommon();

EmAiCalculateRelatedTasks.prototype = {
    initialize: function() {
    },
    
    calculateRelatedTasks: function (alertGr, tasks) {
      var alertSysId = alertGr.sys_id + "";
      
      var currentCalculation = new GlideDateTime();
      
      var alertCiSysId = alertGr.cmdb_ci + "";
      // There is no CI on the alert
      if(GlideStringUtil.nil(alertCiSysId)) {
          gs.log("Alert Insight (EmAiCalculateRelatedTasks): No Ci found for alert: " + alertSysId);
         return;
      }
        
      gs.log("Alert Insight (EmAiCalculateRelatedTasks): Start calculating related tasks for alert: " + alertSysId + " ;Ci: " + alertCiSysId);
    
      try {
		  // Update insight state table with status "In Progress"
          var insightStateRef = emAiInsightCommon.writeToInsightState(alertSysId, currentCalculation, "1");

          var alertManager = new SNC.AlertManager();
          alertManager.calculateRelatedCisAndFindTasks(alertGr, insightStateRef, tasks.toString());
          
      } catch(err) {
          gs.logError("Alert Insight (EmAiCalculateRelatedTasks): Error: " + err);
      } finally {
          // Update insight state table with status "Done"
          emAiInsightCommon.writeToInsightState(alertSysId, currentCalculation, "2");
      }   
    },
    
    type: 'EmAiCalculateRelatedTasks'
};
