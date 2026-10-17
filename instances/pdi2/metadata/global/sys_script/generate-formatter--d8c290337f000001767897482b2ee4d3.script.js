createFormatter();

function createFormatter() {
   //Look to see if a process flow formatter already exists
   var f = new GlideRecord('sys_ui_formatter');
   f.addQuery('table', current.table);
   f.addQuery('formatter', 'process_flow.xml');
   f.query();
   if (!f.next()) {

      //No formatter exists...create one for this table
      var newF = new GlideRecord('sys_ui_formatter');
      newF.name = 'Process Flow';
      newF.table = current.table;
      newF.formatter = 'process_flow.xml';
      newF.type = 'formatter';
      newF.active = 'true';
      newF.insert();
      gs.addInfoMessage(gs.getMessage('Process Flow formatter automatically created for the {0} table', newF.table));
   }
}
