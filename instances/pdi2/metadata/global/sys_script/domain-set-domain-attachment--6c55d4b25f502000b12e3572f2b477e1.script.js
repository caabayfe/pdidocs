// set domain based on parent record's domain
setDomain();

function setDomain() {
   if (current.table_name.nil())
      return;

   var d = new GlideRecord(current.table_name);
   if (!d.isValid())
      return;

   if (!d.get('sys_id', current.table_sys_id))
      return;

   if (typeof(d.sys_domain) == 'object')
      current.sys_domain = d.sys_domain;
}
