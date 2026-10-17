var processor = new CmdbReconciliationProcessor();

current.attributes = processor.removeDotWalk(current.attributes);
current.null_update = processor.removeDotWalk(current.null_update);

gs.addInfoMessage(gs.getMessage("Dot-walking attributes not supported for reconciliation rules!"));
