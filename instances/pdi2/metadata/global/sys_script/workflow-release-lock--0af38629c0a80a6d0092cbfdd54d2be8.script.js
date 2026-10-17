// Releases the lock on current that might have been placed during a workflow reset
// from business rule 'SNC Approval - Reset conditions'


if (typeof chg_wf_lock != "undefined") {

   gs.print(gs.getMessage('Workflow Release Lock business rule is releasing the record lock for {0}', current.getDisplayValue()));
   chg_wf_lock.release();
}
