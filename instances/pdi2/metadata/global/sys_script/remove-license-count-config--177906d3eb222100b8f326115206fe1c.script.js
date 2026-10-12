// If a license is ever deleted (should never happen, unless MAINT deletes it)
// delete the corresponding count config entries
var licence_count_cfg = new LicenseCountConfig(current.name, current.license_type, current.license_id);
licence_count_cfg.deleteCountCfg();
