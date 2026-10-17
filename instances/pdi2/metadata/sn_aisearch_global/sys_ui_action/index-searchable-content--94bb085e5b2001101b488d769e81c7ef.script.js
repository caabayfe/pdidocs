var indexer = new AisMigrationIndexer(current.sys_id);
indexer.indexAllSources();

current.setValue("state", "INDEXING");
current.update();
if (!current.isActionAborted()) action.setRedirectURL(current);
