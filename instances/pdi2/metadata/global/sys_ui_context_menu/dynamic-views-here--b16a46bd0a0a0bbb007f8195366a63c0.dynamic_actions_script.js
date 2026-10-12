/**
  * This server-side script is used to dynamically create actions for the context menu, such as the list of available templates
  * Add items to the context menu by calling:
  *    g_contextMenu.addAction(item_id, label, script_string, order);
  */
buildContextActions();

function buildContextActions() { 
   var vm = RP.getViewManager(); 
   vm.setTable(g_tableName); 
   vm.setTarget('list'); 
   var list = vm.getList();
   var currentView = vm.getViewName();  
   for (var i = 0; i < list.size(); i++) {
      var choice = list.getChoice(i); 
      if (currentView == choice.getValue()) 
         g_contextMenu.addAction('', choice.getLabel(), "", i, 'images/checked.pngx'); 
      else 
         g_contextMenu.addAction('', choice.getLabel(), "changeView('" + choice.getValue() + "')", i);              
   }

}
