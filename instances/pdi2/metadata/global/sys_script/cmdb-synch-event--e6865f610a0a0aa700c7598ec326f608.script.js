// fire a rollup event on every change of a ci
// don't need to worry about firing an event on insert as it can't possibly have a relation yet
// likewise don't need to worry about firing an event on delete as we'll get a host of delete messages for each
// relationship as the delete cascades
gs.eventQueue('relationship.rollup', current);
