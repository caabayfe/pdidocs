var tableCleaner = new global.AppCollaborationTableCleaner();
var descriptorName = current.getDisplayValue('name');
var emptyRecords = tableCleaner.cleanTables(current);
var message = gs.getMessage('Records with empty references removed for {0} descriptor: {1}', [descriptorName, JSON.stringify(emptyRecords, null, 2)]);

gs.addInfoMessage(message);
