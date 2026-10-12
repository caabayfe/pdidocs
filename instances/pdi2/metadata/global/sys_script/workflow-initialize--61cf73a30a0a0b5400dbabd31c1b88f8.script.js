/**
 * Create the Begin and End activities for a new workflow version and
 * connect them to each other
 */

var beginDefID;
var endDefID;

if (current.workflow.nil()) {
   createWorkflow();
   getDefinitionIDs();
   createActivities();

}

function createWorkflow() {
   var gr = new GlideRecord('wf_workflow');
   gr.name = current.name;
   gr.description = current.description;
   gr.table = current.table;
   var id = gr.insert();
   current.workflow = id;
}

// Get the activity_defintion ids for the begin and end activities
function getDefinitionIDs() {
   var gr = new GlideRecord('wf_activity_definition');
   var qc = gr.addQuery('attributes', 'CONTAINS', 'end');
   qc.addOrCondition('attributes', 'CONTAINS', 'begin');
   gr.query();
   while (gr.next()) {
      var parts = gr.attributes.toString().split(',');
      for (var i = 0; i < parts.length; i++) {
         if (parts[i] == 'begin=true')
            beginDefID = gr.sys_id.toString();
         else if (parts[i] == 'end=true')
            endDefID = gr.sys_id.toString();
      }
   }
}

// create the Begin and End activities and connect them with a transition
function createActivities() {
   var gr = new GlideRecord('wf_activity');
   gr.initialize();
   gr.workflow_version = current.sys_id;
   gr.name = gs.getMessage('Begin');
   gr.activity_definition = beginDefID;
   gr.width = "80";
   gr.x = "20";
   gr.y = "20";
   var beginID = gr.insert();
   
   // set this as the workflow's starting activity
   current.start = beginID;
   
   gr.initialize();
   gr.workflow_version = current.sys_id;
   gr.name = gs.getMessage('End');
   gr.activity_definition = endDefID;
   gr.width = "80";
   gr.x = "400";
   gr.y = "150";
   var endID = gr.insert();
   
   // get the condition for the Begin activity (it was created by a business rule on wf_activity)
   var beginConditionID = '';
   gr = new GlideRecord('wf_condition');
   gr.initialize();
   gr.addQuery('activity', beginID);
   gr.queryNoDomain();
   if (gr.next())
      beginConditionID = gr.sys_id + '';
   
   // and finally the transition between the start and end activities
   gr = new GlideRecord('wf_transition');
   gr.initialize();
   gr.condition = beginConditionID;
   gr.from = beginID;
   gr.to = endID;
   gr.insert();
}
