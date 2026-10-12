var AdminCenterUtil = Class.create();
AdminCenterUtil.prototype = {
    initialize: function() {

        // To Do: Generate urls using sn_ace_app_config and sn_ace_page table path values
        this.APP_URI = gs.getProperty('glide.servlet.uri') + 'now/admin-center/';
        this.REGEX_IS_TERM = /([A-Z]{2,})/;
        this.ADMIN_CENTER_READ_ONLY_ROLE_SYS_ID = 'e70c9fe5772811108d987bde5810617d';
        this.ADMIN_ROLE_SYS_ID = '2831a114c611228501d4ea6c309d626d';
    },

    _generateBreadcrumbItem: function(label, route, fields, icon) {
        return {
            label: label,
            href: 'javascript:void(0)',
            route: route,
            fields: fields,
            icon: icon
        };
    },

    getBusinessObjectiveData: function(businessObjectiveId) {
        if (!businessObjectiveId) {

            return {};
        }
        var businessObjective = new GlideRecord('sn_admin_center_business_objective');
        if (!businessObjective.get(businessObjectiveId)) {

            return {};
        }

        return {
            sys_id: businessObjectiveId,
            name: this.getBusinessObjectiveTitle(businessObjectiveId)
        };
    },

    getApplicationData: function(applicationId) {
        if (!applicationId) {

            return {};
        }
        var application = new GlideRecord('sn_admin_center_application');
        if (!application.get(applicationId)) {

            return {};
        }

        return {
            sys_id: applicationId,
            name: application.getValue('sys_name')
        };
    },

    generatePageURL: function(pagePath) {
        return encodeURI(this.APP_URI + pagePath);
    },

    generateItsmBusinessObjectivesBreadcrumbItem: function() {
        var label = gs.getMessage('All adoption blueprints');
        var route = 'adoption-blueprints';
        var fields = {};
        var icon = 'home-outline';

        return this._generateBreadcrumbItem(label, route, fields, icon);
    },

    generateBusinessObjectiveDetailsBreadcrumbItem: function(businessObjectiveId) {
        var label = this.getBusinessObjectiveData(businessObjectiveId).name || gs.getMessage('Adoption Blueprint');
        var route = 'adoption-blueprint-details';
        var fields = {
            businessObjectiveId: businessObjectiveId
        };

        return this._generateBreadcrumbItem(label, route, fields, null);
    },

    generateApplicationDetailsBreadcrumbItem: function(businessObjectiveId, applicationId) {
        var label = this.getApplicationData(applicationId).name || gs.getMessage('Application Details');
        var route = 'app-details';
        var fields = {
            applicationId: applicationId,
            businessObjectiveId: businessObjectiveId
        };

        return this._generateBreadcrumbItem(label, route, fields, null);
    },

    getBusinessObjectiveTitle: function(businessObjectiveId) {
        var businessObjectiveGr = new GlideRecord('sn_admin_center_business_objective');

        if (!businessObjectiveId || !businessObjectiveGr.get(businessObjectiveId))
            return '';

        return businessObjectiveGr.getDisplayValue('name');
    },

    shareViaEmail: function(users, sharedContent, optionalMessage) {
        var result = {
            errors: [],
            successCount: 0,
        };
        var userGlideRecord = new GlideRecord('sys_user');
        for (var i = 0; i < users.length; i++) {
            if (!userGlideRecord.get(users[i].sys_id)) {
                gs.error('[ADMIN_CENTER] Sharing failed. Cannot find user id :' + users[i].sys_id);
                result.errors.push(gs.getMessage('Failed to share with unknown user'));
                continue;
            }

            var userName = userGlideRecord.getValue('name');
            var userEmailAddress = userGlideRecord.getValue('email');
            if (!userEmailAddress) {
                gs.error('[ADMIN_CENTER] Sharing failed. No email address for user id : ' + users[i].sys_id);
                result.errors.push(gs.getMessage('Failed to share because {0} has no email address', userName));
                continue;
            }

            if (!this._grantReadOnlyRoleToUser(users[i].sys_id)) {
                result.errors.push(gs.getMessage('Failed to share because {0} could not be granted access', userName));
                continue;
            }

            var shareError = this._shareViaEmail(userEmailAddress, userName, this.generatePageURL(sharedContent), optionalMessage, null, 'sn_admin_center.share');
            if (shareError) {
                result.errors.push(shareError);
                continue;
            }

            result.successCount++;
        }

        return result;
    },

    shareAdminHomeLandingPageFeedback: function(starRatings, optionalMessage, contactPermission) {
        var result = {
            errors: []
        };
        var shareError = this._shareViaEmail('adminexperience@servicenow.com', 'AdminX team', starRatings, optionalMessage, contactPermission, 'sn_admin_center.landing_page.feedback');
        if (shareError) result.errors.push(shareError);

        return result;
    },

    _shareViaEmail: function(userEmailAddress, userName, sharedContent, optionalMessage, contactPermission, eventName) {
        var senderInfo = this._getSenderNameAndEmail();
        if (senderInfo.error)
            return senderInfo.error;

        var emailBodyData = {
            userName: userName,
            senderName: senderInfo.senderName,
            senderEmailAddress: senderInfo.senderEmailAddress,
            sharedContent: sharedContent,
            optionalMessage: optionalMessage,
            contactPermission: contactPermission
        };
        gs.eventQueue(eventName, null, userEmailAddress, JSON.stringify(emailBodyData));

        return null;
    },

    _getSenderNameAndEmail: function() {
        var senderName = gs.getUserDisplayName();
        var senderEmailAddress = '';
        if (gs.getUserID() !== 'maint') {
            var senderGlideRecord = new GlideRecord('sys_user');

            if (!senderGlideRecord.get(gs.getUserID())) {
                gs.error('[ADMIN_CENTER] Sharing failed. Unable to find sender with user id : ' + gs.getUserID());

                return {
                    error: gs.getMessage('Failed to share using unknown sender')
                };
            }
            senderEmailAddress = senderGlideRecord.getValue('email');
            if (!senderEmailAddress) {
                gs.error('[ADMIN_CENTER] Sharing failed. No email address for sender user with id : ' + users[i].sys_id);

                return {
                    error: gs.getMessage('Failed to share because sender {0} has no email address', senderGlideRecord.getValue('name'))
                };
            }
        }

        return {
            senderName: senderName,
            senderEmailAddress: senderEmailAddress,
            error: null
        };
    },

    _grantReadOnlyRoleToUser: function(userId) {
        var userHasRoleGlideRecord = new GlideRecord('sys_user_has_role');
        userHasRoleGlideRecord.addQuery('user', userId);
        userHasRoleGlideRecord.addQuery('role', this.ADMIN_CENTER_READ_ONLY_ROLE_SYS_ID).addOrCondition('role', this.ADMIN_ROLE_SYS_ID);
        userHasRoleGlideRecord.setLimit(1);
        userHasRoleGlideRecord.query();
        if (userHasRoleGlideRecord.next()) {
            userHasRoleGlideRecord.setValue('sys_updated_on', new GlideDateTime());
            userHasRoleGlideRecord.update();
        } else {
            userHasRoleGlideRecord = new GlideRecord('sys_user_has_role');
            userHasRoleGlideRecord.setValue('user', userId);
            userHasRoleGlideRecord.setValue('role', this.ADMIN_CENTER_READ_ONLY_ROLE_SYS_ID);
            if (!userHasRoleGlideRecord.insert()) {
                gs.error('[ADMIN_CENTER] Unable to grant sn_admin_center.read_only role to user id : ' + userId);

                return false;
            }
        }

        return true;
    },

    _getTextInSentenceCase: function(text) {
        if (!text)
            return '';

        var lowerCaseTextWithTerms = this._toLowerCasePreservingTerms(text);
        return lowerCaseTextWithTerms.charAt(0).toLocaleUpperCase() + lowerCaseTextWithTerms.slice(1);
    },

    _toLowerCasePreservingTerms: function(text) {
        var _self = this;
        // a term is word that needs to be in uppercase. For example: 'AI'
        return text.split(' ').map(function(word) {
            return word.match(_self.REGEX_IS_TERM) ? word : word.toLocaleLowerCase();
        }).join(' ');
    },

    getCurrentInstanceVersion: function() {
        var currentWarFile = new SNC.UpgradeUtil().getCurrentBuild();
        return new SNC.UpgradeUtil().getReleaseFamilyName(currentWarFile);
    },

    type: 'AdminCenterUtil'
};

/* Sample Usage

var headerUtil = new AdminCenterUtil();

headerUtil.getBusinessObjectiveData('7dbeab26ff210110f416d018d53bf1dd');

headerUtil.getApplicationData('ae103b66ff210110f416d018d53bf1a6');

headerUtil.generatePageURL('adoption-blueprint-details/7dbeab26ff210110f416d018d53bf1dd');

headerUtil.generateItsmBusinessObjectivesBreadcrumbItem();
headerUtil.generateBusinessObjectiveDetailsBreadcrumbItem('7dbeab26ff210110f416d018d53bf1dd');
headerUtil.generateApplicationDetailsBreadcrumbItem('7dbeab26ff210110f416d018d53bf1dd','ae103b66ff210110f416d018d53bf1a6');
*/
