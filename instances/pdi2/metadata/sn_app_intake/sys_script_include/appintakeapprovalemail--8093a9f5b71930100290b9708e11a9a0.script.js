var AppIntakeApprovalEmail = Class.create();
AppIntakeApprovalEmail.prototype = {
    initialize: function() {},

    type: 'AppIntakeApprovalEmail',
    getEmailSubject: function() {
        return gs.getMessage("Your app access has been approved");
    },
    getEmailMessage: function(openedBy, appName, devEnvURL) {
        //using double quotes here instead of \' for translation keys
        var g2g = gs.getMessage("{0}Now you can start working on this app{1}", ['<h1 style="margin-bottom: 50px;">', '</h1>']);
        var intro = gs.getMessage('{0}Hi {1},{2}', ['<p>', openedBy, '</p>']);
        var message = gs.getMessage('{0}Your admin has reviewed and approved your request to access {1} in App Engine Studio.{2}', ['<p style="margin-bottom: 24px;">', appName, '</p>']);
        var tips = gs.getMessage('{0}If you need any help while working on this app, try browsing the resources available on App Engine Studio. You can also reach out to your admin if you have any additional questions.{1}', ['<p>', '</p>']);
        var button = '';
        //check if aes is enabled
        if (GlidePluginManager.isActive('com.snc.app-engine-studio')) {
            var trailingSlashRegex = /\/+$/;
            var instanceUrl = devEnvURL && devEnvURL.replace(trailingSlashRegex, '');
            var linkUrl = instanceUrl + '/now/appenginestudio';
            var buttonOpenTags = '<p style="text-align: center; margin-top: 40px;"><a class="btn" href="' + linkUrl + '">';
            var buttonCloseTags = '</a></p>';
            button = gs.getMessage('{0}Go to App Engine Studio{1}', [buttonOpenTags, buttonCloseTags]);
        }
        return g2g + "\n" + intro + "\n" + message + "\n" + tips + "\n" + button;
    },

    getApprovedEmailMessage: function(openedBy, appName, devEnvURL) {
        //using double quotes here instead of \' for translation keys
        var g2g = gs.getMessage("{0}Now you can start working on this app{1}", ['<h1 style="margin-bottom: 50px;">', '</h1>']);
        var intro = gs.getMessage('{0}Hi {1},{2}', ['<p>', openedBy, '</p>']);
        var message = gs.getMessage('{0}Your admin has reviewed and approved your request to access {1}.{2}', ['<p style="margin-bottom: 24px;">', appName, '</p>']);
        var tips = gs.getMessage('{0}If you need any help while working on this app, try browsing the resources available on the Product Documentation site. You can also contact your admin if you have any additional questions.{1}', ['<p>', '</p>']);

        return g2g + "\n" + intro + "\n" + message + "\n" + tips;
    },

    getEmailMessageLimited: function(openedBy, appName) {
        //using double quotes here instead of \' for translation keys
        var g2g = gs.getMessage("{0}Now you can start working on this app{1}", ['<h1 style="margin-bottom: 50px;">', '</h1>']);
        var intro = gs.getMessage('{0}Hi {1},{2}', ['<p>', openedBy, '</p>']);
        var message = gs.getMessage('{0}Your admin has reviewed and approved your request to access {1} in App Engine Studio.{2}', ['<p style="margin-bottom: 24px;">', appName, '</p>']);
        var tips = gs.getMessage('{0}If you need any help while working on this app, try browsing the resources available on App Engine Studio. You can also reach out to your admin if you have any additional questions.{1}', ['<p>', '</p>']);

        return g2g + "\n" + intro + "\n" + message + "\n" + tips;
    },

    getEmailMessageManualPermissionProvisioning: function(openedBy, appName) {
        //using double quotes here instead of \' for translation keys
        var g2g = gs.getMessage("{0}Now you can start working on this app{1}", ['<h1 style="margin-bottom: 50px;">', '</h1>']);
        var intro = gs.getMessage('{0}Hi {1},{2}', ['<p>', openedBy, '</p>']);
        var message = gs.getMessage('{0}Your admin has reviewed and approved your request to access {1} in App Engine Studio.{2}', ['<p style="margin-bottom: 24px;">', appName, '</p>']);

        var adminsGr = new GlideRecord('sys_user_group');
        adminsGr.get(AppIntakeConstants.groups.APP_ENGINE_ADMINS);
        var email = adminsGr.getValue('email');
        if (email) {
            message = message + gs.getMessage('{0}If you need any help while working on this app, try browsing the resources available on App Engine Studio. You can also reach out to your admin at {1} if you have any additional questions.{2}', ['<p>', email, '</p>']);
        } else {
            message = message + gs.getMessage('{0}If you need any help while working on this app, try browsing the resources available on App Engine Studio. You can also reach out to your admin if you have any additional questions.{1}', ['<p>', '</p>']);
        }

        return g2g + "\n" + intro + "\n" + message;
    },

    getEmailMessageAdminManualPermissionProvisioning: function(openedBy, appName) {
        //using double quotes here instead of \' for translation keys
        var g2g = gs.getMessage("{0}Configure permissions for app access{1}", ['<h1 style="margin-bottom: 50px;">', '</h1>']);
        var intro = gs.getMessage('{0}Hi App Engine Admins,{2}', ['<p>', openedBy, '</p>']);
        var message = gs.getMessage('{0}{1} requested access to App Engine Studio for app {2}. The request was approved, but the user can’t access the app until you manually configure their permissions.{3}', ['<p style="margin-bottom: 24px;">', openedBy, appName, '</p>']);
        message = message + gs.getMessage('{0}To configure permissions, add the user to one of these groups:{1}', ['<p style="margin-bottom: 24px;">', '<ul>']);
        message = message + gs.getMessage('{0}{1}App Engine Studio Users{2} - users can edit and create apps{3}', ['<li>', '<b>', '</b>', '</li>']);
        message = message + gs.getMessage('{0}{1}App Engine Studio User Limited{2} - users can only edit apps{3}', ['<li>', '<b>', '</b>', '</li>']);
        message = message + gs.getMessage('</ul></p>');

        return g2g + "\n" + intro + "\n" + message;
    },

    getEmailMessageToAdminManualProvisioning: function(openedBy, appName) {
        //using double quotes here instead of \' for translation keys
        var g2g = gs.getMessage("{0}Configure permissions for app access{1}", ['<h1 style="margin-bottom: 50px;">', '</h1>']);
        var intro = gs.getMessage('{0}Hi App Engine Admins,{2}', ['<p>', openedBy, '</p>']);
        var message = gs.getMessage('{0}{1} requested access the {2} app. The request was approved, but you need to manually configure their permissions before they can access it.{3}', ['<p style="margin-bottom: 24px;">', openedBy, appName, '</p>']);
        message = message + gs.getMessage('{0}To configure permissions, add the user to one or more of these groups:{1}', ['<p style="margin-bottom: 24px;">', '<ul>']);

        var userGroupPermissionTypes = new GlideRecord('sn_app_intake_permission_type');
        userGroupPermissionTypes.addActiveQuery();
        userGroupPermissionTypes.orderBy('order');
        userGroupPermissionTypes.query();

        while (userGroupPermissionTypes.next()) {
            message = message + gs.getMessage('{0}{1}{2}{3}{4}', ['<li>', '<b>', userGroupPermissionTypes.group.getRefRecord().getValue('name'), '</b>', '</li>']);
        }

        message = message + gs.getMessage('</ul></p>');

        return g2g + "\n" + intro + "\n" + message;
    },

    getEmailMessageToRequestorManualPermissionProvisioning: function(openedBy, appName) {
        //using double quotes here instead of \' for translation keys
        var g2g = gs.getMessage("{0}Now you can start working on this app{1}", ['<h1 style="margin-bottom: 50px;">', '</h1>']);
        var intro = gs.getMessage('{0}Hi {1},{2}', ['<p>', openedBy, '</p>']);
        var message = gs.getMessage('{0}Your admin has reviewed and approved your request to access {1}.{2}', ['<p style="margin-bottom: 24px;">', appName, '</p>']);

        var adminsGr = new GlideRecord('sys_user_group');
        adminsGr.get(AppIntakeConstants.groups.APP_ENGINE_ADMINS);
        var email = adminsGr.getValue('email');
        if (email) {
            message = message + gs.getMessage('{0}If you need any help while working on this app, try browsing the resources available on the Product Documentation site. You can also contact your admin at {1} if you have any additional questions.{2}', ['<p>', email, '</p>']);
        } else {
            message = message + gs.getMessage('{0}If you need any help while working on this app, try browsing the resources available on the Product Documentation site. You can also contact your admin if you have any additional questions.{1}', ['<p>', '</p>']);
        }

        return g2g + "\n" + intro + "\n" + message;
    },
};
