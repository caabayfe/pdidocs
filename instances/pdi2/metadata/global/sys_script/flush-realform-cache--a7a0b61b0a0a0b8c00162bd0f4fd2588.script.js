// When a non-report View changes, flush the realform cache
if (current.name.toString().indexOf("RPT") != 0) {
	SNC.FormsCacheFlushHandler.flush(current.getTableName());
}
