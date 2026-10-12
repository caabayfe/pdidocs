var hadAttribute = (previous.attributes && previous.attributes.indexOf('update_sync') >= 0);

if (current.attributes.indexOf('update_sync') >=0 && !hadAttribute) {
  current.setAbortAction(true);  
  current.attributes.setError("Cannot add an update_synch attribute to a dictionary entry");
}  
