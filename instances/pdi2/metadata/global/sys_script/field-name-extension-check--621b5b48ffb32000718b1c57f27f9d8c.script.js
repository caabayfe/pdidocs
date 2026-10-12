var ml = current.max_length;
if (ml > 30) {
   gs.print("Abort extension of sys_dictionary.element");
   gs.print("This message comes from the Field name extension check business rule");
   if (!gs.isPaused()) {
      var msgArray = new Array();
      msgArray.push("'" + current.element + "'");
      msgArray.push("'" + current.name + "'");
      var msg = gs.getMessage("Field {0} in table {1} NOT extended", msgArray);
      gs.addInfoMessage(msg);
   }
   current.max_length = previous.max_length;
}
