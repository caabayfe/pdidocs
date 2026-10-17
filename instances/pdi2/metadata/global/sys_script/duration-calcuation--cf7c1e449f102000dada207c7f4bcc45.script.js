if (current.end.isNil())
   current.duration = gs.dateDiff(current.start.getDisplayValue(), gs.nowDateTime(), false );
else
   current.duration = gs.dateDiff(current.start.getDisplayValue(), current.end.getDisplayValue(), false );
