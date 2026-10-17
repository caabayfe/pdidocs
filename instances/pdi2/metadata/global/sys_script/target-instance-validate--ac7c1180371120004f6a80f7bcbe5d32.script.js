authenticate();

function authenticate() {
  var validator = new InstanceRetrieverAjax();
  var url = current.instance_url;
  var user = current.admin_user;
  var pass = current.admin_password.getDecryptedValue();

  if (validator.authenticate(url, user, pass)) {
    var model = validator.getInstanceRecord();
    if (!isValidTarget(model)) {
      current.setAbortAction(true);
      return;
    }

    current.instance_id = model.instance_id;
    current.instance_name = model.instance_name;
    current.production = model.production;
    current.war_version = model.war_version;
    current.database_name = model.database_name;
    current.database_tablespace = model.database_tablespace;
    current.database_type = model.database_type;
    current.database_user = model.database_user;
    current.database_password = model.database_password; // encrypted password
    current.database_url = model.database_url;
	current.admin_password = '';
  } else {
    gs.addErrorMessage(validator.getErrorMessage());
    current.setAbortAction(true);
    return;
  }
}

function isValidTarget(target) {
  if (gs.nil(target.instance_id)) {
    gs.addErrorMessage("Target instance is not valid: missing required property 'instance_id'.");
    return false;
  }

  var sourceInstanceId = gs.getProperty("instance_id")+"";
  if (target.instance_id == sourceInstanceId) {
    gs.addErrorMessage("Target instance is not valid: instance_id matches source");
    return false;
  }
   
  if (targetExists(target)) {
    gs.addErrorMessage("Target instance already exists (cannot create new record)");
    return false;
  }

  return true;
}

function targetExists(target) {
  var gr = new GlideRecord("instance");
  gr.addQuery("source", false);
  var qc = gr.addQuery("instance_id", target.instance_id);
  qc.addOrCondition("instance_url", target.instance_url);
  gr.query();
  return gr.next();
}
