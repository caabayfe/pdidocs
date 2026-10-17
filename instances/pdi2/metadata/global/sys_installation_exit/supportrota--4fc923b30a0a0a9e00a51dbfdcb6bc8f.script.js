gs.include("PrototypeServer");

var SupportRota = Class.create();

SupportRota.prototype = {
   initialize: function() {
   },

   /**
    * globals on call are:
    *
    *    incident - GlideRecord
    *    ci_field - field in incident record containing the 'ci' to check
    *         support rota assignments against
    *
    * returns: list of support assignments that match the incident
    */
   process: function() {
      var conditions;
      var match;
      var assignments = new Object();

      // Get any cmn_rota_ci's that match the incident CI
      var rotaCIs = new Array();
      var gr = new GlideRecord("cmn_rota_ci");
      var ciGR = new GlideRecord("cmdb_ci");
      var ciSysId = incident.getValue(ci_field);
      if (ciSysId && ciGR.get(ciSysId)) {
         gr.addQuery("ci", incident.getValue(ci_field));
         gr.query();
         while (gr.next()) {
	    // Does this cmn_rota_ci entry pass the conditions
            conditions = gr.conditions;
            match = true;
            if (conditions && !GlideFilter.checkRecord(ciGR, conditions, true)) {
                match = false;	    
            } 
            if (match) {
               // This is a rota_ci we care about
               rotaCIs.push(gr.sys_id);
            }
         }
      }

      // Now check the assignment group rosters
      var assignmentGroup = incident.assignment_group;
      gr = new GlideRecord("cmn_rota_assignment");
      gr.initialize();
      gr.addQuery("group", assignmentGroup);
      gr.addQuery("rota_ci", "NULL");
      gr.query();
      while (gr.next()) {
	 // Does this roster pass the conditions
         conditions = gr.conditions;
         match = true;
         if (conditions && !GlideFilter.checkRecord(incident, conditions, true)) {
             match = false;	    
         } 
         if (match) {
            // One we care about
            assignments[gr.sys_id] = true;
         }
      }

      if (rotaCIs.length > 0) {
         gr.initialize();
         gr.addQuery("rota_ci", rotaCIs);
         gr.query();
         while (gr.next()) {
	    // Does this roster pass the conditions
            conditions = gr.conditions;
            match = true;
            if (conditions && !GlideFilter.checkRecord(incident, conditions, true)) {
               match = false;	    
            } 
            if (match) {
               // One we care about
               assignments[gr.sys_id] = true;
            }
         }
      }

      return assignments;
   }
};
