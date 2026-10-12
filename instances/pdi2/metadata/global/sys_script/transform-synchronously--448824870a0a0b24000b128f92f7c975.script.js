// only executes when import set is created by single insert Import set API
var importSetGr = new GlideRecord("sys_import_set");
importSetGr.get(current.sys_import_set);
var importSetId = importSetGr.getUniqueValue();
var importSetRun = new GlideImportSetRun(current.sys_import_set);
var importLog = new GlideImportLog(importSetRun, "SOAP Transform");
var ist = new GlideImportSetTransformer();
ist.setLogger(importLog);
ist.setImportSetRun(importSetRun);
ist.setImportSetID(importSetId);
ist.setSyncImport(true);
ist.transformAllMaps(importSetGr, current.getUniqueValue());
