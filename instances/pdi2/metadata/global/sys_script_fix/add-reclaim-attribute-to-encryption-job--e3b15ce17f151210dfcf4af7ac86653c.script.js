addReclaimSizeAttribute();

function addReclaimSizeAttribute() {
    try {
        var td = GlideTableDescriptor.get('sys_mass_encryption_job');
        if (td == null) {
            gs.error("Table Descriptor for 'sys_mass_encryption_job' is null, unable to add 'min_reclaim_size_mb' attribute");
            return;
        }
        var ed = td.getED();
        if (ed == null) {
            gs.error("Element Descriptor for 'sys_mass_encryption_job' is null, unable to add 'min_reclaim_size_mb' attribute");
            return;
        }
        GlideBootstrap.mergeTableAttributes(ed, 'min_reclaim_size_mb=1024');
        gs.info("'min_reclaim_size_mb' attribute added and set to 1024mb for sys_mass_encryption_job table");
    } catch (e) {
        gs.error("Exception adding min_reclaim_size_mb attribute to encryption job table - " + e.toString());
    }
}
