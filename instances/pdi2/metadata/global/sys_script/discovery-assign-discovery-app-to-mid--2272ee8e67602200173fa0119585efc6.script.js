(function() {

/* All MID servers used by the schedule (either directly or through cluster) will
   be assigned to Discovery application if not already assigned to Discovery or
   to ALL. */

   var discoAppSysId = getSysId('ecc_agent_application', 'name', 'Discovery');
   var allAppSysId = getSysId('ecc_agent_application', 'name', 'ALL');
   var appAssigned = false;

   if (!discoAppSysId) {
      gs.error('Discovery application does not exist in ecc_agent_application table');
      return;
   }
   if (!allAppSysId) {
      gs.error('ALL application does not exist in ecc_agent_application table');
      return;
   }
   if (current.mid_select_method == 'specific_mid') {
      createMapping(current.mid_server);
   } else if (current.mid_select_method == 'specific_cluster') {
      processCluster(current.mid_cluster);
   }
   if (appAssigned) {
      var msg = gs.getMessage('The Discovery application was added to the MID Server(s) configured for this schedule. ');
      var ref = gs.getProperty('help.base.servicenow') + 'CSHelp:MIDDiscoApplication';
      var link = ' <a target="_blank" href="' + ref + '">' + gs.getMessage('More Info') + '</a>';
      gs.addInfoMessage(msg + link);
   }

   function createMapping(midSysId) {
      if (mappingExists(midSysId)) {
         gs.log('MID server application mapping already exists');
         return;
      }
      gs.log('Assigning Discovery application to MID ' + midSysId);
      var gr = new GlideRecord('ecc_agent_application_m2m');
      gr.agent = '' + midSysId;
      gr.application = '' + discoAppSysId;
      if (JSUtil.notNil(gr.insert()))
         appAssigned = true;
   }

   function processCluster(mid_cluster) {
      gr = new GlideRecord('ecc_agent_cluster_member_m2m');
      gr.addQuery('cluster', mid_cluster);
      gr.query();
      while (gr.next())
         createMapping(gr.agent);
   }

   function mappingExists(midSysId) {
      var gr = new GlideRecord('ecc_agent_application_m2m');
      gr.addQuery('agent', midSysId);
      var qc = gr.addQuery('application', discoAppSysId);
      qc.addOrCondition('application', allAppSysId);
      gr.query();
      return gr.hasNext();
   }

   function getSysId(tableName, fieldName, value) {
      var gr = new GlideRecord(tableName);
      gr.addQuery(fieldName, value);
      gr.query();
      if (gr.next())
         return gr.sys_id;
      return null;
   }

})();
