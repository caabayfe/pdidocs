current.active = false;
current.work_end = nowDateTime();
if (!current.work_start.nil())
    current.business_duration = gs.calDateDiff(current.work_start.getDisplayValue(), current.work_end.getDisplayValue(), false);
