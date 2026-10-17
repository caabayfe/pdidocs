function getLDAPSources() {
   var list = new Packages.java.util.ArrayList();
   var ds = new GlideRecord('sys_data_source');
   ds.addQuery('type', 'LDAP');
   ds.query();
   while (ds.next())
      list.add(ds.import_set_table_name.toString());
   
   return list;
}
