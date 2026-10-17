//
// Close any child incidents
//
if (current.active.changesTo(false)) {
   closeRelatedTasks(current);
}
