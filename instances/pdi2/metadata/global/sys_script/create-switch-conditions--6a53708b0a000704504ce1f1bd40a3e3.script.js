createSwitchConditions();

function createSwitchConditions() {
   // Create the default conditions for this activity (if it is not a child)
   var grCondition = new GlideRecord('wf_condition');
   var created = false;
   var order = 1000;
   
   // supports custom "Switch" activity
   if (current.vars.type == "variable") {
      var var_choice = new GlideRecord('question_choice');
      var_choice.addQuery('question', current.vars.item_variable);
      var_choice.orderBy('order');
      var_choice.query();
      while (var_choice.next()) {
         created = true;
         grCondition.initialize();
         grCondition.activity = current.sys_id;
         grCondition.name = var_choice.text;
         grCondition.condition = "activity.result == '" + var_choice.value + "'";
         grCondition.order = order;
         grCondition.insert();
         order++;
      }
   } else if (current.vars.type == "field") {
       var path = current.workflow_version.table + "." + current.vars.field;
       var ce =  new GlideCompositeElement(path);
       var field = ce.getTargetField();
       var table = ce.getTargetTD().getName();
       var cl =  new GlideChoiceListGenerator(table, field).get();
       for (var i = 0; i < cl.size(); i++) {
          created = true;
          grCondition.initialize();
          grCondition.activity = current.sys_id;
          grCondition.name = cl.getChoice(i).getLabel();
          grCondition.condition = "activity.result == '" + cl.getChoice(i).getValue() + "'";
          grCondition.order = order;
          grCondition.insert();
          order++;
       }
   }

   if (created) {
      // remove the 'always' condition created by earlier business rule
      grCondition.initialize();
      grCondition.addQuery("activity", current.sys_id);
      grCondition.addQuery("name", gs.getMessage('Always'));
      grCondition.addQuery("condition", "true");
      grCondition.query();
      if (grCondition.next())
         grCondition.deleteRecord();
   }
}
