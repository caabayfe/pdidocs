const DomainDAO = Class.create();
(function() {
	/**
     * Determies if Domain separation is actively being used on a given instance
     * @type boolean
     */
    DomainDAO.isDomainSeparationActive = () => {
        const domainSeparationGR = new GlideRecord("domain");

        if (domainSeparationGR.isValid()) {
            domainSeparationGR.addQuery("active", true);
            domainSeparationGR.query();
            return domainSeparationGR.hasNext();
        }

        return false;

    };

    DomainDAO.prototype = {
        initialize: function() {
            throw 'Not supported';
        },
        type: 'DomainDAO'
    };
})();
