validateDBConnection();

function validateDBConnection() {
        gs.print("Validating Standby Source...");

	var dbName = current.database_name;
	var user = current.database_user;
	var password = current.database_password;
	var url = current.database_url;
	var rdbms = current.database_type;
	var tablespace = current.database_tablespace;
	
        try {
          var instance = new SncCloneInstance(dbName,user,password,url,rdbms,tablespace);

          // verify that the database exists
	  if (!instance.instanceDatabaseExists()) {
	    gs.addErrorMessage('Source cannot be cloned from: database does not exist');
  	    current.setAbortAction(true);
  	    return;
	  }

	  // verify that the alternative source can be cloned from
	  if (!instance.canCloneFrom()) {
	    gs.addErrorMessage('Source cannot be cloned from: instance_id does not match primary database (it appears to be a different database)');
  	    current.setAbortAction(true);
  	    return;
	  }

          // capture the source instance id and service url
	  current.instance_id = gs.getProperty("instance_id") + "";
          if (gs.nil(current.instance_name))
	    current.instance_name = "Standby Database";
          if (gs.nil(current.instance_url))
  	    current.instance_url = gs.getProperty("glide.servlet.uri") + "";
          current.production = gs.getProperty("glide.installation.production");
          current.war_version = gs.getProperty("glide.war") + "";
        } catch(e) {
          gs.addErrorMessage('Source cannot be cloned from: unable to connect to database and verify instance_id');
  	  current.setAbortAction(true);
          return;
        }
}
