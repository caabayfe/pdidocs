var PDScopeSwitcher = Class.create();
PDScopeSwitcher.prototype = {
    initialize: function() {
        this.shouldOverrideTransactionScope;
        this.originalScope;

        this.shouldOverrideUpdateSet;
        this.originalUpdateSetId;
        this.glideUpdateSet;
    },
    type: 'PDScopeSwitcher',

    // @param processScope - scope to switch to, same as scope of process being updated
    // @param updateSetId - if passed in, used to switch the update set
    // call this at the start of a try block
    switchScope: function(processScope, updateSetId) {
        var currentApplicationId = gs.getCurrentApplicationId();
        var enableTransactionScopeOverride = gs.getProperty('com.glide.pad.core.model.enableTransactionScopeOverride');

        // if currentApplicationId === processScope then a sysparm_transaction_scope might have been passed in
        // if we switch to the sysparm_transaction_scope which is meant to be temporary, it'll end up permament which we don't want
        this.shouldOverrideTransactionScope = enableTransactionScopeOverride &&
            Boolean(processScope) && currentApplicationId !== processScope;

        this.shouldOverrideUpdateSet = enableTransactionScopeOverride && updateSetId;

        if (this.shouldOverrideTransactionScope) {
            this.originalScope = currentApplicationId;
            gs.setCurrentApplicationId(processScope);
        }

        if (this.shouldOverrideUpdateSet) {
            this.glideUpdateSet = new GlideUpdateSet();
            this.originalUpdateSetId = this.glideUpdateSet.get();
            this.glideUpdateSet.set(updateSetId);
        }
    },

    // call this at the in the finally block
    resetScope: function() {
        if (this.shouldOverrideTransactionScope && this.originalScope) {
            gs.setCurrentApplicationId(this.originalScope);
        }

        if (this.shouldOverrideUpdateSet && this.originalUpdateSetId) {
            this.glideUpdateSet.set(this.originalUpdateSetId);
        }
    }
};
