/**
 * Generate all approvals and/or tasks in the workflow, setting the order based on the
 * activity's (shortest path) level in the workflow
 */
var GenerateActivityHandler = Class.create();
GenerateActivityHandler.prototype = Object.extendsObject(WFActivityHandler, {
   
   initialize: function() {
      WFActivityHandler.prototype.initialize.call(this);
   },
   
   onExecute: function() { 
	  this.activity = activity;
	   
	  if ((typeof SNC.WorkflowPaths) != 'undefined')
		  this._generateAprovalsAndTasks();
	  else
		  this._generateActivities();
   },
	
   /**
 	* As we generate tasks and approvals, we keep track of
 	* their duration.  For each path along the workflow, we bump the starting
 	* time we have computed so far using the following algorithm:
 	*
 	* 		for a task or approval
 	* 			if the start time is earlier than the previous start time
 	* 				we encountered (in case we see the task/approval more
 	* 				than once) - use the earlier start time
 	*
 	* 		for a join activity
 	* 			if the start time is later than the previous start time
 	* 				we encountered, use the later start time (this ensures
 	* 				that we use the longest path to the join since the
 	* 				join waits for all predecessors to complete)
 	*/
	_generateAprovalsAndTasks: function() {
		var paths = new SNC.WorkflowPaths(context.workflow_version.sys_id.getGlideRecord());
		this.activitiesMap = paths.getGenerateActivities(this.activity.activity.sys_id.toString());
		for (var a = 0; a < this.activitiesMap.size(); a++) {
			var activity = this.activitiesMap.get(a);
			if (activity.get("type").indexOf("generate=approval") >= 0)
				startDateTime = this._generateNewApproval(activity);
			
			if (activity.get("type").indexOf("generate=task") >= 0)
				startDateTime = this._generateNewTask(activity);
		}
	},
	
	_generateNewApproval: function(activity) {
	   this.generate(activity.get("sys_id"), activity.get("order"), activity.get("start"), this.activity.vars.generate_approvals == false);
    },
   
    _generateNewTask: function(activity) {
       this.generate(activity.get("sys_id"), activity.get("order"), activity.get("start"), this.activity.vars.generate_tasks == false);
    },
   
   /**
    * We need to walk each sequence that has conditions that are not skipped
    * during generate.  As we generate tasks and approvals, we keep track of
    * their duration.  For each path along the workflow, we bump the starting
    * time we have computed so far using the following algorithm:
    *
    * 		for a task or approval
    * 			if the start time is earlier than the previous start time
    * 				we encountered (in case we see the task/approval more
    * 				than once) - use the earlier start time
    *
    * 		for a join activity
    * 			if the start time is later than the previous start time
    * 				we encountered, use the later start time (this ensures
    * 				that we use the longest path to the join since the
    * 				join waits for all predecessors to complete)
    */
   _generateActivities: function() {
	  this.walker = new WalkWorkflow(context.workflow_version.sys_id.getGlideRecord());
      this.walker.walk();
	   
      this.joins = {};
      this.visited = {};
      this.ofInterest = {};
      this.ofInterest[this.activity.activity.sys_id.toString()] = true;
      this.startDateTime = new GlideDateTime();
      for (var i = 0; i < this.walker.sequences.length; i++)
         this._generateSequence(this.walker.sequences[i]);

      this.walker = null;
   },
   
   _generateSequence: function(seq) {
      if (seq.length == 0)
         return;
      
      var startDateTime = new GlideDateTime(this.startDateTime);
      // skip any activities that are not of interest
      var ndx = 0;
      while (ndx < seq.length) {
         var id = seq[ndx];
         if (this.ofInterest[id])
            break;
         
         if (!this.walker.activities[id].isJoin)
            this.visited[id] = new GlideDateTime(startDateTime);
         
         ndx++;
      }
      
      while (ndx < seq.length) {
         startDateTime = this._generateActivityID(seq[ndx], startDateTime);
         ndx++;
      }
   },
   
   _generateActivityID: function(id, startDateTime) {
      if (this.visited[id])
         return this.visited[id];
      
      var a = this.walker.activities[id];
      if (!a || !a.attributes)
         return startDateTime;
      
      return this._generateActivity(a, startDateTime);
   },
   
   _generateActivity: function(a, startDateTime) {
      var id = a.sys_id;
      if (a.attributes.indexOf("generate=approval") >= 0) {
         startDateTime = this._generateApproval(a, startDateTime);
         this.visited[id] = new GlideDateTime(startDateTime);
         return startDateTime;
      }
      
      if (a.attributes.indexOf("generate=task") >= 0) {
         startDateTime = this._generateTask(a, startDateTime);
         this.visited[id] = new GlideDateTime(startDateTime);
         return startDateTime;
      }
      
      // generate any children if we have them
      if (a.children.length > 0) {
         var newStartDateTime = new GlideDateTime(startDateTime);
         for (var i = 0; i < a.children.length; i++) {
            var sdt = this._generateActivity(a.children[i], new GlideDateTime(startDateTime));
            if (sdt.compareTo(newStartDateTime) > 0)
               newStartDateTime = sdt;
         }
         this.visited[id] = new GlideDateTime(newStartDateTime);
         return newStartDateTime;
      }
      
      if (a.isJoin) {
         // if we process a join then it is ofInterest since the sequences
         // are broken at the joins
         this.ofInterest[id] = true;
         var join = new GlideDateTime(startDateTime);
         if (this.joins[id]) {
            var sdt = this.joins[id];
            if (sdt.compareTo(startDateTime) > 0)
               join = sdt;
         }
         this.joins[id] = join;
         return join;
      }
      
      this.visited[id] = new GlideDateTime(startDateTime);
      return startDateTime;
   },
   
   _generateApproval: function(a, startDateTime) {
	   var duration = this.generate(a.sys_id, a.order, startDateTime.getValue(), this.activity.vars.generate_approvals == false);
       startDateTime.add(duration);
       return startDateTime;
   },
   
   _generateTask: function(a, startDateTime) {
      var duration = this.generate(a.sys_id, a.order, startDateTime.getValue(), this.activity.vars.generate_tasks == false);
      startDateTime.add(duration);
      return startDateTime;
   },
   
   type: 'GenerateActivityHandler'
});
