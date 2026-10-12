/**
 Service-now.com

 Description:  Prevent recursion in schedules.  
 Given two schedules A and B, if B is included as a other schedule of A then A can't be included as a other schedule of B.

Prevents this Scenario:
Schedule:  A, Child Schedule:  B
Schedule:  B, Child Schedule:  A
**/ 

var child = current.child_schedule;
var parent = current.schedule;

var other = new GlideRecord("cmn_other_schedule");
other.addQuery("child_schedule", parent);
other.addQuery("schedule", child);
other.query();
if (other.getRowCount() > 0) {
   current.setAbortAction(true);
   gs.addErrorMessage(gs.getMessage('The other schedule loops back to this record (recursive schedule loop)'));
}
