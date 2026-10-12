
var ic = new ImportSetCleaner();
// delete import sets and their related import set rows
// that were created more than or equal to 7 days ago
ic.setDaysAgo(7);
ic.clean();
