//
// Get a reference qualifier for a template group
//
function getGroupQualifier() {
   if (gs.hasRole('admin'))
      return null;
   
   return "sys_id=javascript:getMyGroups()";
}
