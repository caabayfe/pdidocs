var SessionDomainUtil = Class.create();
SessionDomainUtil.prototype = {
    // comma separated scopes that are allowed to use this script include
    _ALLOWED_SCOPES: 'sn_ai_observe,sn_metric_engine',
    _callerScopeName: '',

    initialize: function() {
        // must be captured here, not in a private method, or the caller is always global
        this._callerScopeName = gs.getCallerScopeName();
    },

    _isAuthorized: function() {
        var allowedScopes = this._ALLOWED_SCOPES.split(','); // turn into array
        var scopeAllowed = allowedScopes.indexOf(this._callerScopeName) > -1;

        return scopeAllowed;
    },

    _displayErrorMessage: function() {
        gs.addErrorMessage(gs.getMessage('This API can be called only from {0} scope.', this._ALLOWED_SCOPES));
    },

    associateDomain: function(domainId) {
        if (!this._isAuthorized()) {
            this._displayErrorMessage();
            return;
        }

        gs.getSession().setDomainID(domainId);
    },

    addDomainQuery: function(gr, domainRecord) {
        if (!this._isAuthorized()) {
            this._displayErrorMessage();
            return;
        }

        gr.addDomainQuery(domainRecord);
    },

    queryNoDomain: function(gr) {
        if (!this._isAuthorized()) {
            this._displayErrorMessage();
            return;
        }

        gr.queryNoDomain();
    },

    getVisibleDomainSet: function(domainId) {
        if (!this._isAuthorized()) {
            this._displayErrorMessage();
            return null;
        }

        var visibleDomains = [];
        var domainSet = GlideDomainSupport.getVisibleDomainSet(domainId);
        if (!domainSet) {
            return visibleDomains;
        }
        var iter = domainSet.iterator();
        while (iter.hasNext()) {
            var domain = iter.next();
            var id = domain.getID();
            if (id) {
                visibleDomains.push(id);
            }
        }
        return visibleDomains;
    },

    type: 'SessionDomainUtil'
};
