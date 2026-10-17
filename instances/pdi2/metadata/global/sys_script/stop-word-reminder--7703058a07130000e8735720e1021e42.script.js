var op = current.operation();
var warn = false;
if (op == "delete" && !current.active.changes() && current.active == true)
  warn = true;
else if (op == "update") {
   if (current.active.changes() && current.active == false)
      warn = true;
   else if (current.word.changes() && current.active == true)
      warn = true;
}

if (warn)
   gs.addInfoMessage(gs.getMessage("All text indexes should be regenerated to apply the stop word change"));
