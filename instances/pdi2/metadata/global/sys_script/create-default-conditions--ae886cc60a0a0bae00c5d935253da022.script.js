createDefaultConditions();

function createDefaultConditions() {
   // the End activity does not need any conditions
   var attributes = current.activity_definition.attributes;
   if (attributes && GlideStringUtil.decodeAttributes(attributes).containsKey("end"))
      return
   
   // Create the default conditions for this activity (if it is not a child)
   var grCondition = new GlideRecord('wf_condition');
   
   var copied = false;
   
   // copy over the default conditions from the activity definition
   var grDefault = new GlideRecord('wf_condition_default');
   grDefault.addQuery('activity_definition', current.activity_definition);
   grDefault.query();
   while (grDefault.next()) {
      copied = true;
      grCondition.initialize();
      grCondition.activity = current.sys_id;
      grCondition.name = grDefault.name;
      grCondition.condition_default = grDefault.sys_id;
      grCondition.condition = grDefault.condition;
      grCondition.short_description = grDefault.short_description;
      grCondition.event = grDefault.event;
      grCondition.event_name = grDefault.event_name;
      grCondition.else_flag = grDefault.else_flag;
      grCondition.skip_during_generate = grDefault.skip_during_generate;
      if (!grDefault.order.nil())
         grCondition.order = grDefault.order;
      
      grCondition.insert();
   }
   
   if (!copied) {
      // insert the 'always' condition
      grCondition.activity = current.sys_id;
      grCondition.name = gs.getMessage('Always');
      grCondition.condition = 'true';
      grCondition.short_description = '';
      grCondition.order = 0;
      grCondition.insert();
   }
}
