var IdentityTypeUtil = Class.create();
var HUMAN = 'human';
var MACHINE = 'machine';
var AI_AGENT = 'ai_agent';
var UNCLASSIFIED = 'unclassified';
var WEB_SERVICE_ACCESS_ONLY = 'web_service_access_only';
var IDENTITY_TYPE = 'identity_type';
var SYS_USER = 'sys_user';
var TRUE = 'true';
var FALSE = 'false';
var EMPTY = '';
var NOT_IN = 'NOT IN';

IdentityTypeUtil.prototype = {

    initialize: function() {},

    fixIdentityType: function() {
        this.fixEmptyIdentityType();
        this.fixIncorrectIdentityType();
    },

    fixIncorrectIdentityType: function() {
        //If identity type is machine and 'Web service access only' is false(or empty) update 'Web service access only' to true
        this.fixWSAFlagForMachineUsers();

        //If identity type is human,ai agent and 'Web service access only' is true update 'Web service access only' to false
        this.fixWSAFlagForHumanOrAIUsers();

        //If identity type is unclassified or completely invalid but not empty and 'Web service access only' is true, the identity type should be set to machine
        this.fixUnclassifiedOrInvalidUsersWithWSA();

        // If identity type is something that is completely invalid but not empty and 'Web service access only' is false/empty, the identity type should be set to unclassified
        this.fixInvalidUsersWithoutWSA();
    },

    fixEmptyIdentityType: function() {
        //If 'Web service access only' is true, the identity type should be set to machine
        this.updateIdentityTypeForUsers(MACHINE);

        //If 'Web service access only' is false or empty, the identity type should be set to unclassified
        this.updateIdentityTypeForUsers(UNCLASSIFIED);
    },

    updateIdentityTypeForUsers: function(identityType) {
        try {
            var query = new GlideDBQuery(SYS_USER);
            query.addQuery(IDENTITY_TYPE, EMPTY); //Not to update for users that already have Identity Type set
            this.updateQueryCondition(query, identityType);
            var update = new GlideDBUpdate(SYS_USER);
            update.setQuery(query);
            update.setMultiple(true);
            update.setValue(IDENTITY_TYPE, identityType);
            update.execute();
        } catch (e) {
            gs.error('IdentityTypeUtil::updateIdentityTypeForUsers Error: ', e);
        } finally {
            update.close();
            query.close();
        }
    },

    updateQueryCondition: function(query, identityType) {
        if (identityType == MACHINE) {
            query.addQuery(WEB_SERVICE_ACCESS_ONLY, TRUE);
        }
        if (identityType == UNCLASSIFIED) {
            query.addQuery(WEB_SERVICE_ACCESS_ONLY, FALSE).addOrCondition(WEB_SERVICE_ACCESS_ONLY, EMPTY);
        }
    },

    fixWSAFlagForMachineUsers: function() {
        try {
            //If identity type is machine and 'Web service access only' is false(or empty) update 'Web service access only' to true
            var query = new GlideDBQuery(SYS_USER);
            query.addQuery(IDENTITY_TYPE, MACHINE);
            query.addQuery(WEB_SERVICE_ACCESS_ONLY, FALSE).addOrCondition(WEB_SERVICE_ACCESS_ONLY, EMPTY);
            var update = new GlideDBUpdate(SYS_USER);
            update.setQuery(query);
            update.setMultiple(true);
            update.setValue(WEB_SERVICE_ACCESS_ONLY, TRUE);
            update.execute();
        } catch (e) {
            gs.error('IdentityTypeUtil::fixWSAFlagForMachineUsers Error: ', e);
        } finally {
            update.close();
            query.close();
        }
    },

    fixWSAFlagForHumanOrAIUsers: function() {
        try {
            //If identity type is human,ai agent and 'Web service access only' is true update 'Web service access only' to false
            var query = new GlideDBQuery(SYS_USER);
            query.addQuery(IDENTITY_TYPE, HUMAN).addOrCondition(IDENTITY_TYPE, AI_AGENT);
            query.addQuery(WEB_SERVICE_ACCESS_ONLY, TRUE);
            var update = new GlideDBUpdate(SYS_USER);
            update.setQuery(query);
            update.setMultiple(true);
            update.setValue(WEB_SERVICE_ACCESS_ONLY, FALSE);
            update.execute();
        } catch (e) {
            gs.error('IdentityTypeUtil::fixWSAFlagForHumanOrAIUsers Error: ', e);
        } finally {
            update.close();
            query.close();
        }
    },

    fixUnclassifiedOrInvalidUsersWithWSA: function() {
        try {
            // If identity type is unclassified or something that is completely invalid but not empty and 'Web service access only' is true, the identity type should be set to machine
            var identityTypeList = [EMPTY, HUMAN, MACHINE, AI_AGENT];
            var query = new GlideDBQuery(SYS_USER);
            query.addQuery(IDENTITY_TYPE, NOT_IN, identityTypeList);
            query.addQuery(WEB_SERVICE_ACCESS_ONLY, TRUE);
            var update = new GlideDBUpdate(SYS_USER);
            update.setQuery(query);
            update.setMultiple(true);
            update.setValue(IDENTITY_TYPE, MACHINE);
            update.execute();
        } catch (e) {
            gs.error('IdentityTypeUtil::fixUnclassifiedOrInvalidUsersWithWSA Error: ', e);
        } finally {
            update.close();
            query.close();
        }
    },

    fixInvalidUsersWithoutWSA: function() {
        try {
            // If identity type is something that is completely invalid but not empty and 'Web service access only' is false/empty, the identity type should be set to unclassified
            var identityTypeList = [EMPTY, HUMAN, MACHINE, AI_AGENT, UNCLASSIFIED];
            var query = new GlideDBQuery(SYS_USER);
            query.addQuery(IDENTITY_TYPE, NOT_IN, identityTypeList);
            query.addQuery(WEB_SERVICE_ACCESS_ONLY, FALSE).addOrCondition(WEB_SERVICE_ACCESS_ONLY, EMPTY);
            var update = new GlideDBUpdate(SYS_USER);
            update.setQuery(query);
            update.setMultiple(true);
            update.setValue(IDENTITY_TYPE, UNCLASSIFIED);
            update.execute();
        } catch (e) {
            gs.error('IdentityTypeUtil::fixInvalidUsersWithoutWSA Error: ', e);
        } finally {
            update.close();
            query.close();
        }
    },

    type: 'IdentityTypeUtil'
};
