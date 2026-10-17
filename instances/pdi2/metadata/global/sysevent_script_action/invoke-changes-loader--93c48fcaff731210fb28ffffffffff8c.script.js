var source = event.parm1;
new SNC.CDCDataCollectorJob().runChangesLoader(source);
gs.info("Invoked changes loader for source id " + source);
