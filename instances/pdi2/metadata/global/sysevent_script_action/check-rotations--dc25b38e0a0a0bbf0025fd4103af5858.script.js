var rot = new GlideRecord('sys_table_rotation');
if (rot.isValid()) {
   var tu = new SNC.TableRotationUtil();
   if (tu)
      tu.synchronize();
}
