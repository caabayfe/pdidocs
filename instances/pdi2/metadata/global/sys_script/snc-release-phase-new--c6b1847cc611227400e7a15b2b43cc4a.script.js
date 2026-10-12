updateProject(current, 'Phase ' + current.name.getDisplayValue()+" added to project");

function updateProject(me, journal) {  
  var friends = new GlideRecord('release_project');
  friends.addQuery('sys_id', me.release);
  friends.query();
  while(friends.next()) {       
     friends.release_history.setJournalEntry(journal);
     friends.update();
  }
}
