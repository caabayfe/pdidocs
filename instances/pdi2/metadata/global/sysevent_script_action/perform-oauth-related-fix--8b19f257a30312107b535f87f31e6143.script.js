function fixInboundGrantTypeField() {
	gs.print("fixInboundGrantTypeField: Start");
	// This function will update the inbound_grant_type field in the oauth_entity, oauth_jwt and oauth_oidc_entity tables for existing records.
	// The inbound_grant_type field will be updated based on the values of fields in the record.
	// The inbound_grant_type field will be set to one of the following values:
	// 1. authz_code: If the record has redirect_url configured.
	// 2. cc: If the record has user field configured.
	// 3. ropc: If the record has client_secret configured.
	// 4. jwt: If the record has user_field configured.
	// 5. multiple: If the record satisfies more multiple criteria as mentioned for 1,2,3,4.
	// 6. uncertain: If we are not able to confidently categorize the record based on 1,2,3,4.
	// 7. oidc: If the record is of type oauth_oidc_entity.
	var gr = new GlideRecord('oauth_entity');
	if(!gr.isValidField("inbound_grant_type")) {
		gs.print("oauth_entity_inbound_grant_type_field_classification: inbound_grant_type field not present");
	} else {
		gr.addNullQuery("inbound_grant_type");
		gr.query();
		if(gr.next()) {
			var api = new SNC.OAuthEntityBuilder(gr); // requires a dummy GlideRecord object as parameter
			api.setInboundGrantType("plugin.upgraded " + event.parm1); // passing source 'plugin.upgraded' that will be logged
		}
	}
	gs.print("fixInboundGrantTypeField: End");
}

function fixScopeRestrictionStatus() {
	function setUseraccountScopeRestrictionStatus() {
		// This function will assign 'useraccount' to 'scope_restriction_status' for all 'oauth_entity' which have 'useraccount' scope mapped
		gs.print("setUseraccountScopeRestrictionStatus: starting");
		var useraccountEntities = [];
		var useraccountScope = GlideProperties.get('glide.oauth.token.scope.useraccount', 'd67787c4c321011089a7dd5c2840dd6e');
		var entityScopeMapping = new GlideRecord("oauth_entity_auth_scope_mapping");
		entityScopeMapping.addQuery("auth_scope", useraccountScope);
		entityScopeMapping.setWorkflow(false);
		entityScopeMapping.query();
		while(entityScopeMapping.next()) {
			useraccountEntities.push(entityScopeMapping.getValue("oauth_entity"));
		}
		if(useraccountEntities.length > 0) {
			gs.print("setUseraccountScopeRestrictionStatus: Entities with useraccount scope and empty scope_restriction_status: " + useraccountEntities.toString());
			var oauthEntity = new GlideRecord("oauth_entity");
			oauthEntity.addQuery("sys_id", "IN", useraccountEntities.toString());
			oauthEntity.setValue("scope_restriction_status", "useraccount");
			oauthEntity.setWorkflow(false);
			oauthEntity.autoSysFields(false);
			oauthEntity.setUseEngines(false);
			oauthEntity.updateMultiple();
		} else {
			gs.print("setUseraccountScopeRestrictionStatus: no entities with useraccount scope and empty scope_restriction_status");
		}
		gs.print("setUseraccountScopeRestrictionStatus: completed");
		return useraccountEntities;
	}

	function updateScopeRestrictionStatus(tableName) {
		gs.print("updateScopeRestrictionStatus: starting " + tableName);
		var tableGR = new GlideRecord(tableName);
		tableGR.addNullQuery('scope_restriction_status');
		tableGR.setWorkflow(false);
		tableGR.autoSysFields(false);
		tableGR.setValue('scope_restriction_status', 'unrestricted');
		tableGR.setUseEngines(false);
		tableGR.updateMultiple();
		gs.print("updateScopeRestrictionStatus: completed " + tableName);
	}

	gs.print("fixScopeRestrictionStatus: Start");
	var gr = new GlideRecord('oauth_entity');
	if(!gr.isValidField("scope_restriction_status")) {
		gs.print("fixScopeRestrictionStatus: scope_restriction_status field not present");
		return;
	}
	setUseraccountScopeRestrictionStatus();
	updateScopeRestrictionStatus('oauth_entity');
	gs.print("fixScopeRestrictionStatus: Completed.");
}

// Update newly introduced fields token_format and sub_claim to default values
function fixTokenFormatField() {

    function updateToDefaultValues() {
        var gr = new GlideRecord('oauth_entity');
        if (!gr.isValid() || !gr.isValidField('token_format') || !gr.isValidField('sub_claim')) {
            log("oauth_entity table doesn't exist or token_format field is not present in the table");
            return;
        }

        gr.addNullQuery('token_format');
        gr.addNullQuery('sub_claim');
        gr.setValue('token_format', 'opaque');
        gr.setValue('sub_claim', 'sys_id');
        gr.setWorkflow(false);
        gr.autoSysFields(false);
        gr.setUseEngines(false);
        gr.updateMultiple();
		
        log("Successfully updated token_format and sub_claim field values");
    }

    function log(msg) {
        gs.print("Fix_Token_Format_Field: " + msg);
    }

    try {
        log("Started updating token_format and sub_claim fields to default values");
        updateToDefaultValues();
        log("Finished updating token_format and sub_claim fields to default values");
    } catch (e) {
        log("Exception while updating the field values" + e);
    }
}

// Update newly introduced field bind_token_to_session to default value (false)
function fixBindTokenToSessionField() {

    function updateToDefaultValue() {
        var gr = new GlideRecord('oauth_entity');
        if (!gr.isValid() || !gr.isValidField('bind_token_to_session')) {
            log("oauth_entity table doesn't exist or bind_token_to_session field is not present");
            return;
        }

        gr.addNullQuery('bind_token_to_session');
        gr.setValue('bind_token_to_session', false);
        gr.setWorkflow(false);
        gr.autoSysFields(false);
        gr.setUseEngines(false);
        gr.updateMultiple();

        log("Successfully updated bind_token_to_session field values to false");
    }

    function log(msg) {
        gs.print("Fix_Bind_Token_To_Session_Field: " + msg);
    }

    try {
        log("Started updating bind_token_to_session field to default value of false");
        updateToDefaultValue();
        log("Finished updating bind_token_to_session field to default value of false");
    } catch (e) {
        log("Exception while updating the field value: " + e);
    }
}

fixInboundGrantTypeField();
fixScopeRestrictionStatus();
fixTokenFormatField();
fixBindTokenToSessionField();
