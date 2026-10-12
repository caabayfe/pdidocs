var mapgr = new GlideRecord("sys_transform_entry");
mapgr.addQuery("map", current.map);
mapgr.addQuery("target_field", current.target_field);
mapgr.query();
if (mapgr.next()) {
  if (current.sys_id != mapgr.sys_id) {
    current.target_field.setError("An existing map to this target field already exist");
    current.setAbortAction(true);
  }
}
