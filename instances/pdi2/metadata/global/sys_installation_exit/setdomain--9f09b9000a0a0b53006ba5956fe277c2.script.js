gs.include("PrototypeServer");

var SetDomain = Class.create();
SetDomain.prototype = {
    NOTIFY_PROPERTY : 'glide.sys.domain.domain_change_notify',

    initialize : function() {
    },

    process : function() {
		var currentDomain = current.sys_domain;
		var tableName = current.getTableName();
		var domainMasterAttribute = GlideDomainSupport.getFullyQualifiedDomainMasterAttribute(tableName);
		if (domainMasterAttribute && domainMasterAttribute != '') {
			var domainMasterElement = current.getElement(domainMasterAttribute);
			if (domainMasterElement)
				currentDomain = domainMasterElement.sys_domain;
		}
        var domainName = new GlideDomainDisplay(currentDomain).IDToDisplay();
        this._notify(domainName);

        return currentDomain;
    },

    _notify: function(domainName) {

        if ('global' == domainName)
            return;

        if (gs.getProperty(this.NOTIFY_PROPERTY) == 'true')
            gs.addInfoMessage(gs.getMessage("Your domain has been set to {0}", domainName));
    }
}        
