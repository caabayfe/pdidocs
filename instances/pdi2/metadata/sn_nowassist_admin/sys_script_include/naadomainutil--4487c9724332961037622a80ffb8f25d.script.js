var NAADomainUtil = {

    getDomainName: function(domainId) {
        try {
            var domainGr = new GlideRecord(NAAConstant.DOMAIN);
            return domainGr.isValid() && domainGr.get(domainId) ? domainGr.getValue("name") : NAAConstant.EMPTY_STRING;
        } catch (e) {
            gs.error("Unable to retrieve domain name " + e);
            return "";
        }
    },

    isRecordDomainSeparationEnabled: function() {
        return gs.getProperty('glide.sys.domain.use_record_domain_for_processes') === 'true';
    },

    type: 'NAADomainUtil'
};
