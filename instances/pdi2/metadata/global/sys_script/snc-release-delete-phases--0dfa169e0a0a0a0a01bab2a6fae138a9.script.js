gs.log("Release Delete Phase starting");
deletePhases(current);
gs.log("Release Delete Phase ending");

function deletePhases(current) {
   var grPhase = new GlideRecord('release_phase');  
   grPhase.addQuery('release', '=', current.sys_id);
   grPhase.query();
   while (grPhase.next()) {
      grPhase.deleteRecord();
   }
}
