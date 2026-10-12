var levels = parseInt(gs.getProperty("svc.manual.convert.levels.default_value", 3));

//update the levels from metadata for dynamic services
var metadata = current.metadata;
if (JSON.parse(metadata).levels) {
    levels = parseInt(JSON.parse(metadata).levels);
}

var convertor = new CreateOrUpdateITService();
convertor.convertDynamicToManual(current.sys_id);

var pms = new PopulateManualService();
pms.process(current.sys_id, levels, false);
