var rot = new GlideRecord('sys_table_rotation');
if (rot.isValid()) {
   if (event.parm2 == 'false') {
      var tu = new SNC.TableRotationUtil();
      if (tu)
         tu.synchronize();
   } 
}
