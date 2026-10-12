
var acrUsers = [];
var mfaPropertyName = "glide.authenticate.multifactor";
var upgradeScriptStartTimeProperty = "glide.authenticate.multifactor.upgrade.script_start_time";
var tableNotPresentMessage = "{0} table is not present in instance.";
var upgradeScriptStartTime = new GlideDateTime();

process();

function process() {
    var propValue = GlidePropertiesDB.get(upgradeScriptStartTimeProperty);
    if (!propValue) {
        this.logInfo("Proceeding with current date time as we did not find the property {0}", upgradeScriptStartTimeProperty);
    } else {
        upgradeScriptStartTime.setValue(Number(propValue));
        removeProperty(upgradeScriptStartTimeProperty);
    }
    //Clear all the MFA set up data (excluding ACR user data) if present in the instance.
    clearMfaSetUpUserData();
    //Activate Multi Factor Authentication system property
    var mfaProperty = GlideProperties.getBoolean(mfaPropertyName);
    var isDevInstance = GlideUtil.isDeveloperInstance();
    var isAnyTestEnvironment = GlideProperties.getBoolean("glide.test_instance")
        || GlideProperties.getBoolean("glide.test.full_environment.initialized")
        || GlideProperties.getBoolean("glide.test.environment.initialized");
    if (!mfaProperty && !isDevInstance && !isAnyTestEnvironment){
        activateProperty(mfaPropertyName);
    }
}

// Removes property from sys_properties
function removeProperty(propertyName) {
    var gr = new GlideRecord("sys_properties");
    gr.addQuery("name", upgradeScriptStartTimeProperty);
    gr.query();
    if (gr.next()) {
        // To stop running BRs on the sys_properties
        gr.setWorkflow(false);
        // This is to stop having this change added to update set.
        gr.setUseEngines(false);
        gr.deleteRecord();
        this.logInfo("{0} temp system property is removed", upgradeScriptStartTimeProperty);
    }
}

// Clears MFA set up data for users
function clearMfaSetUpUserData() {
    getAcrData();
    //Delete user data from user_multifactor_auth, sys_user_public_credential, sys_user_multi_factor_setup apart from ACR users
    //TOTP MFA set up data
    clearSetUpData("user_multifactor_auth");
    //FIDO/Web Authenticator set up data
    clearSetUpData("sys_user_public_credential");
    //Recent factors MFA data
    clearSetUpData("sys_user_multi_factor_setup");
}

// ACR user set up data should not be deleted. This method will update acrUsers
function getAcrData() {
    var acrGr = new GlideRecord("acr_user");
    if (!acrGr.isValid()) {
        this.logInfo(tableNotPresentMessage, "acr_user");
        return;
    }
    acrGr.query();
    while (acrGr.next()) {
        acrUsers.push(acrGr.getValue("acr_user"));
    }
}

// Clears all set-up data from table except ACR data
function clearSetUpData(table) {
    var gr = new GlideRecord(table);
    if (!gr.isValid()) {
        this.logError(tableNotPresentMessage, table);
        return;
    }
    gr.addEncodedQuery("userNOT IN" + acrUsers);
    gr.addQuery("sys_created_on", "<", upgradeScriptStartTime);
    gr.query();
    if (!gr.hasNext()) {
        this.logInfo("No stale data is present in {0} table.", table);
        return;
    }
    try {
        gr.deleteMultiple();
        this.logInfo("cleared data from {0} table", table);
    } catch (e) {
        this.logError("Error while clearing data from {0} table. Error: {1}", [table, e]);
    }
}

// Activates the given property
function activateProperty(propertyName) {
    try {
        GlidePropertiesDB.set(propertyName, true);
        this.logInfo("Property {0} activated", propertyName);
        this.logInfo("Resource: System Property {0}. Value before upgrade: {1}. Value after upgrade: {2}", [propertyName, false, true]);
    } catch (e) {
        this.logError("Error while updating System Property {0}. Error: {1}", [propertyName, e]);
    }
}

// Logs an Info message with prefix clear_stale_mfa_setup_record_job
function logInfo(message, params) {
    gs.info("clear_stale_mfa_setup_record_job: " + message, params);
}

// Logs an Error message with prefix clear_stale_mfa_setup_record_job
function logError(message, params) {
    gs.error("clear_stale_mfa_setup_record_job: " + message, params);
}
