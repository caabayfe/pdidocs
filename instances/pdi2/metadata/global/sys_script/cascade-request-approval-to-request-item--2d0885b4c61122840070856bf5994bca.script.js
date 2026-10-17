/**
 * The Request has been approved, rejected or cancelled.  Propogate this state
 * change down to the request items.
 */
new global.CatalogRequestUtil(current).cascadeRequestApproval();
