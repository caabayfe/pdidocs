var processor = new CmdbReconciliationProcessor();

var abort = processor.removeSysAndCmdbSpecificFields(current.attributes);

if (abort) {
	current.setAbortAction(true);
}
