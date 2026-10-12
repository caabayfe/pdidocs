if (current.name == 'change_request' && current.element == 'phase') {
   if (current.operation() == 'insert')
      addChangePhase(current);
   else if (current.operation() == 'delete') 
      deleteChangePhase(current);
   else if (current.operation() == 'update') {
      if (current.value.changes()) {
         deleteChangePhase(previous);
         addChangePhase(current);
      }
   }
}

function addChangePhase(current) {
   var gp = new GlideRecord('sys_choice');
   gp.addQuery('name', '=', 'change_phase');
   gp.addQuery('element', '=', 'name');
   gp.addQuery('value', '=', current.value);
   gp.query();
   if (!gp.next()) {
      gp.initialize();
      gp.name='change_phase';
      gp.element='name';
      gp.value=current.value;
      gp.label=current.label;
      gp.insert();
   }
}

function deleteChangePhase(me) {
   var gc = new GlideRecord('sys_choice');
   gc.addQuery('name', '=', 'change_request');
   gc.addQuery('element', '=', 'phase');
   gc.addQuery('value', '=', me.value);
   gc.query();
   if (!gc.next()) {
      var gp = new GlideRecord('sys_choice');
      gp.addQuery('name', '=', 'change_phase');
      gp.addQuery('element', '=', 'name');
      gp.addQuery('value', '=', me.value);
      gp.query();
      if (gp.next())
         gp.deleteRecord();
   }
}
