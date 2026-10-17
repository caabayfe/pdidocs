var op = current.operation();
var warn = false;
if (op == "delete" && current.stop_mode == "3" && !current.stop_mode.changes())
   warn = true;
else if (op == "update" && previous.stop_mode == "3") {
   if (current.stop_mode.changes())
      warn = true;
   else if (current.word.changes())
      warn = true;
}

if (warn)
   gs.addInfoMessage(gs.getMessage("This text index should be regenerated to apply the stop word change"));
