if (current.isValidField("close_code") && current.close_code.nil())
   current.close_code = "Resolved by caller";
if (current.isValidField("close_notes") && current.close_notes.nil())
   current.close_notes = gs.getMessage("Closed by Caller");
