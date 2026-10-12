/**
 Service-now.com 

 Description:  Prevent recursion.  A parent schedule can't loop back to itself.  Schedule A can't be a parent of Schedule A.
**/ 
if (ScheduleValidation.isRecursive(current))
   current.setAbortAction(true);
