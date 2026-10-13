(function executeRule(current, previous /*null when async*/) {
  // Getting all the tables extending "cmdb_ci_server" so that we consider even the newer
  // ones if added later.
  var serverExtendedtables = GlideDBObjectManager.get().getAllExtensions('cmdb_ci_server');
  serverExtendedtables = new JSON().decode(serverExtendedtables);
  
  // Fetch the sys id of the "Instantiates::Instantiated by" & "Virtualized by::Virtualizes" relationship. For VMWare, we connect the server and vmware instance record via "Instantiates::Instantiated by" relationship. For AWS & Azure, we connect the server and vmware instance record via "Virtualized by::Virtualizes" relationship.
  var fetchedRelSysIDs = [],
    lookUpRels = ['Instantiates::Instantiated by', 'Virtualized by::Virtualizes'];
  lookUpRels.forEach(function(relName) {
    var relSysIDGR =  new GlideRecordUtil().getGlideRecordByAttribute('cmdb_rel_type','name', relName);
    if (relSysIDGR.next())
      fetchedRelSysIDs.push(relSysIDGR.getValue('sys_id'));
  });
  
  if (fetchedRelSysIDs.length) {
    var relGR = new GlideRecord("cmdb_rel_ci");
    relGR.addQuery('parent.sys_class_name', 'IN', serverExtendedtables);
    relGR.addQuery('child', current.getValue('sys_id'));
    relGR.addQuery('type', 'IN', fetchedRelSysIDs);
    relGR.query();
    while (relGR.next()) {
      var ciGR = new GlideRecord('cmdb_ci');
      ciGR.addQuery('sys_id', relGR.getValue('parent'));
      ciGR.query();
      if (ciGR.next()) {
        try {
          ciGR.setValue('operational_status', current.operational_status);
          ciGR.setValue('install_status', current.install_status);
          ciGR.update();
        } catch (e) { }
      }
    }
  }
})(current, previous);
