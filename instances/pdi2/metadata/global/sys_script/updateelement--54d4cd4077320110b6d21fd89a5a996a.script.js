// only update the DB field if the DB table exists
if (GlideTableDescriptor.get(current.name.toString()).isValid()) {
    // disable run engines here to prevent uncessary save
    var runEngines = GlideSession.get().setRunEngines(false);
    var transaction = GlideTransaction.get();
    var previousCancelState = null;
    try {
        if (transaction != null) {
            previousCancelState = transaction.isUncancelable();
            transaction.setCannotCancel(true);
        }
        current.updateElement();
    } finally {
        if (transaction != null && previousCancelState != null)
            transaction.setCannotCancel(previousCancelState);

        GlideSession.get().setRunEngines(runEngines);
    }
}
