var IdeGitCredentialAuthCredentialChoices = Class.create();
IdeGitCredentialAuthCredentialChoices.prototype = {
    initialize: function() {},

    process: function() {

        // Add supported credential tables below
        return ['basic_auth_credentials', 'oauth_2_0_credentials'];
    },

    type: 'IdeGitCredentialAuthCredentialChoices'
};
