var GFStrategy = Class.create();
GFStrategy.prototype = {
    initialize: function(strategyId,strategyGR) {
    this.strategyId = strategyId;
    this.strategyGR = strategyGR;
    },
  
  getStrategyGR: function(strategyId){
    if(!this.strategyGR){
      if(strategyId)
        this.strategyId = strategyId;
      this.strategyGR = new GlideRecord(GoalFrameworkConstants.STRATEGY_TABLE);
      this.strategyGR.get(this.strategyId);
    }
    return this.strategyGR;
  },
  
  getGoals: function(encodedQuery){
    var goals = new GlideRecord(GoalFrameworkConstants.GOAL_TABLE);
    goals.addQuery("strategy",this.strategyId);
    if(encodedQuery)
      goals.addEncodedQuery(encodedQuery);
    goals.query();
    return goals;
  },
  
  getStrategicPlanGR: function(encodedQuery){
    var strategicPlanGR = new GlideRecord(GoalFrameworkConstants.STRATEGIC_PLAN);
    strategicPlanGR.addQuery("sys_id",this.getStrategyGR().getValue('strategic_plan'));
    if(encodedQuery)
      strategicPlanGR.addEncodedQuery(encodedQuery);
    strategicPlanGR.query();
    return strategicPlanGR;
  },
  
  validateDates: function() {
        var sPriorityStartDate = this.getStrategyGR().start_date;
        var sPriorityEndDate = this.getStrategyGR().end_date;
        if (sPriorityStartDate && sPriorityEndDate && sPriorityStartDate > sPriorityEndDate)
            return gs.getMessage("Start date cannot be later than the end date.");

        if (GlidePluginManager.isActive('com.sn_align_core')) {
            var sPlanStartDate = this.getStrategyGR().strategic_plan.start_date;
            var sPlanEndDate = this.getStrategyGR().strategic_plan.end_date;
            if (sPriorityStartDate && sPlanStartDate && sPriorityStartDate < sPlanStartDate)
                return gs.getMessage("Start date of the strategic priority cannot be earlier than the start date of its strategic plan. ({0}).", [GlideStringUtil.escapeHTML(sPlanStartDate)]);
            else if (sPriorityEndDate && sPlanEndDate && sPriorityEndDate > sPlanEndDate)
                return gs.getMessage("End date of the strategic priority cannot be later than the end date of its strategic plan. ({0}).", [GlideStringUtil.escapeHTML(sPlanEndDate)]);
        }
        return "";
    },

    type: 'GFStrategy'
};
