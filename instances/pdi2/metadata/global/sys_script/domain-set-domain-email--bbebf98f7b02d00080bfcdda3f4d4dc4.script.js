// set domain based on parent record's domain
setDomain();

// if the domain is global, set to user's domain
if (current.sys_domain == 'global' || current.sys_domain.nil())
   current.sys_domain = session.getCurrentDomainID();

function setDomain() {
   if (current.target_table.nil())
      return;

   var d = new GlideRecord(current.target_table);
   if (!d.isValid())
      return;

   if (!d.get('sys_id', current.instance))
      return;

   if (typeof(d.sys_domain) == 'object')
      current.sys_domain = d.sys_domain;
}
