// on insert, check that a clone is not running
if (new CloneAPI().isCloneRunning()) {
  gs.addErrorMessage('A clone is already running.');
  current.setAbortAction(true);  
}

if (gs.nil(current.name))
  current.name = current.target_instance.database_name;
