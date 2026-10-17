var CSRDecodeCertificateAjax = Class.create();
CSRDecodeCertificateAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

    getCommonAlternateName: function() {

        var sCSR = this.getParameter('sysparm_CSRString');
        var commonName = SNC.DiscoveryCertificateUtil.readCommonNameFromCSR(sCSR);
        var alternateName = SNC.DiscoveryCertificateUtil.readSubjectAlternateNameFromCSR(sCSR);
        var obj = {
            "CommonName": commonName,
            "AlternateNames": alternateName
        };
        return JSON.stringify(obj);
    },

    //To get all the subject attributes from CSR
    getSubjectAttributesFromCSR: function() {
        var csr = this.getParameter('sysparm_CSRString');
        return this.decodeSubjectAttributesFromCSR(csr);
    },
    decodeSubjectAttributesFromCSR: function(csr) {
        var csrAttributes = JSON.parse(SNC.DiscoveryCertificateUtil.readSubjectAttributesFromCSR(csr));
        var csrAttrObj = {
            "subject_common_name": (!gs.nil(csrAttributes.subject_common_name)) ? csrAttributes.subject_common_name : '',
            "subject_alternative_name": (!gs.nil(csrAttributes.subject_alternative_name)) ? csrAttributes.subject_alternative_name.replace(/\n/g , ", ").replace(/[,]\s*$/g, "") : '',
            "organization": (!gs.nil(csrAttributes.organization)) ? csrAttributes.organization : '',
            "organizational_unit": (!gs.nil(csrAttributes.organizational_unit)) ? csrAttributes.organizational_unit : '',
            "locality": (!gs.nil(csrAttributes.locality)) ? csrAttributes.locality : '',
            "province": (!gs.nil(csrAttributes.state)) ? csrAttributes.state : '',
            "country": (!gs.nil(csrAttributes.country)) ? csrAttributes.country : '',
            "email": (!gs.nil(csrAttributes.email)) ? csrAttributes.email : ''
        };
        return JSON.stringify(csrAttrObj);
    },

	//Adding this method here as dropColumn needs to be called from global scope
	//This method is being called from the fix script "Drop Encrypted Keystore Password Column"
	dropColumnFromTable: function(table, column) {
		gs.info("Dropping the column " + column +" from "+ table +" Table.");
		gs.dropColumn(table, column);
	},

	//Adding this method here as setDomainID needs to be called from global scope
	//Method to change current domain
	setDomainId: function(domainId) {
		GlideSession.get().setDomainID(domainId);
	},


    type: 'CSRDecodeCertificateAjax'
});
