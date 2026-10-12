var cmdb_ci = new GlideRecord("cmdb_ci");
if(cmdb_ci.get(current.configuration_item)  && !(GlidePluginManager.isActive('com.sn_hamp') && sn_hamp.HAMRitmUtils && sn_hamp.HAMRitmUtils.prototype.canUpdateCIAssignedTo && new sn_hamp.HAMRitmUtils().canUpdateCIAssignedTo(current))) {
  cmdb_ci.install_status = 4; // pending install
  cmdb_ci.assigned_to = current.request.requested_for;
  cmdb_ci.assigned = gs.nowDateTime();

  current.work_notes = "Configuration item assigned from stock";

  cmdb_ci.update();
}
