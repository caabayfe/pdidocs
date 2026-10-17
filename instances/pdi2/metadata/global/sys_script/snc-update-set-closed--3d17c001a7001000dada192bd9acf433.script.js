/**
 Service-now.com
 
 Description: Update set has been marked complete, track when and by whom
**/

current.completed_by = gs.getUserID();
current.completed_on = gs.nowDateTime();
