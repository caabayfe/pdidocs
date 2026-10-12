var DomainSelect = Class.create();

DomainSelect.prototype = {
    initialize: function() {
    },

    getList: function() {
        var domainList = this._getDomainList();
        var cl = new GlideChoiceList();
        for (var i = 0; i < domainList.length; i++) {
            var domainId = domainList[i];
            var c = cl.getChoice(domainId)
            if (c != null)
                continue;

            var dd = new GlideDomainDisplay(domainId);
            cl.add(domainId, dd.IDToDisplay());
        }

        cl.sort();
        var cls = new GlideChoiceListSet();
        cls.setSelected(cl);
        var document = cls.toXML();
        var e = document.getDocumentElement();
        var domainId = GlideDomainSupport.getCurrentDomainValueOrGlobal();
        var dd = new GlideDomainDisplay(domainId);
        domainName = dd.IDToDisplay();
        e.setAttribute("currentDomain", domainName);
        e.setAttribute("currentDomainId", domainId);
        answer = document;
        return document;
    },

    getReferenceList: function() {
        var domainList = this._getDomainList();
        var cl = new GlideChoiceList();
        for (var i = 0; i < domainList.length; i++) {
            var domainId = domainList[i];
            var c = cl.getChoice(domainId)
            if (c != null)
                continue;

            cl.add(domainId, domainId);
            if (i > 2)
                break;
        }

        var cls = new GlideChoiceListSet();
        cls.setSelected(cl);
        var document = cls.toXML();
        var e = document.getDocumentElement();
        var domainId = GlideDomainSupport.getCurrentDomainValueOrGlobal();
        var dd = new GlideDomainDisplay(domainId);
        domainName = dd.IDToDisplay();
        e.setAttribute("currentDomain", domainName);
        e.setAttribute("currentDomainId", domainId);
        e.setAttribute("availableDomains", domainList.length+'');
        answer = document;
        return document;
    },


    getMyDomainRefQual: function() {
        // Global and Admin users can see all domains, we don't need a refQual
        var domainId = GlideDomainSupport.getCurrentDomainValueOrGlobal();
        if (domainId == 'global' || gs.hasRole('admin'))
            return '';

        var domainList = this._getDomainList();
        var filter = "sys_idIN";
        filter += domainList.join(',');
        return filter;
    },

    changeDomain: function(id) {
        new SNC.DomainPickerGenerator().changeDomain(id);
    },

    setDefaultDomain: function() {
        var domainId = this._getUsersDomainID();
        if (gs.nil(domainId))
            return this.changeDomain('global');

        this.changeDomain(domainId);
    },

    _getDomainList: function() {
        var domainList = new Array();
		var userDomain = this._getUsersDomainID();
		if (gs.nil(userDomain)) {
			userDomain = "global"; //no domain is same as global
		}

        // global domain only available to admins or people assigned to the global domain
        if (userDomain == "global" || gs.hasRole("admin")) {
            domainList.push('global');
            this._getAllDomains(domainList);
        }
        else
            this._getMyDomains(domainList, userDomain);

        return domainList;
    },

    _getAllDomains: function(cl) {
        var gr = new GlideRecord(GlideDomainSupport.getDomainTable());
        if (!gr.isValid())
            return;

        var parentField = GlideUserGroup.getParentField(gr);
        if (!parentField)
            return;

        var domains = GlideDomainTree.get();
        if (domains == null)
            return;

		for (var it = domains.values().iterator(); it.hasNext(); ) {
            var domain = it.next();
			
			if (domain.isActive() || !GlideDomainSupport.shouldExcludeInactiveDomainsFromPicker()) {
			var domainId = domain.getID();
            cl.push(domainId);
			}
        }
    },

    _getMyDomains: function(cl, domainId) {
        var iter = GlideDomainSupport.getVisibleDomainSet(domainId).iterator();
        while (iter.hasNext()) {
            var domain = iter.next();
            var domainId = domain.getID();
            if (domainId == "global")
                continue;

            var c = cl.getChoice(domainId);
            if (c != null)
                continue;

			if (domain.isActive() || !GlideDomainSupport.shouldExcludeInactiveDomainsFromPicker())
			    cl.push(domainId);
        }
    },

    _getUsersDomainID: function() {
        var user = new GlideRecord('sys_user');
        user.addQuery('sys_id', gs.getUserID());
        user.queryNoDomain();
        if (user.next())
            return user.sys_domain;

        return '';
    }
};        
