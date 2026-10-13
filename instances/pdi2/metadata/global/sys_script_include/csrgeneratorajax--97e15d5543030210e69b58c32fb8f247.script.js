var CSRGeneratorAjax = Class.create();
CSRGeneratorAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    generateCSR: function() {
        var csrAttributes = {};
        var subjectCommonName = '' + this.getParameter('sysparm_subject_common_name');
        var subjectAlternativeName = '' + this.getParameter('sysparm_subject_alternative_name');
        var organization = '' + this.getParameter('sysparm_organization');
        var organizationUnit = '' + this.getParameter('sysparm_organizational_unit');
        var locality = '' + this.getParameter('sysparm_locality');
        var province = '' + this.getParameter('sysparm_province');
        var country = '' + this.getParameter('sysparm_country');
        var email = '' + this.getParameter('sysparm_email');

        if (subjectCommonName && subjectCommonName != '') {
            csrAttributes.subject_common_name = subjectCommonName;
        }

        if (subjectAlternativeName && subjectAlternativeName != '')
            csrAttributes.subject_alternative_name = subjectAlternativeName;

        if (organization && organization != '')
            csrAttributes.organization = organization;

        if (organizationUnit && organizationUnit != '')
            csrAttributes.organization_unit = organizationUnit;

        if (locality && locality != '')
            csrAttributes.locality = locality;

        if (province && province != '')
            csrAttributes.province = province;

        if (country && country != '')
            csrAttributes.country = country;

        if (email && email != '')
            csrAttributes.email = email;

        var responseObj = JSON.parse(SNC.DiscoveryCertificateUtil.generateCSR(csrAttributes));

        var attachmentSysId = "";
        try {
            var grTemp = new GlideRecord('sc_cart_item');
            grTemp.initialize();
            var gsa = new GlideSysAttachment();
            attachmentSysId = gsa.write(grTemp, 'private_key.pem', 'PKCS#8', responseObj['private_key']);
            responseObj.attachmentSysId = attachmentSysId;
        } catch (ex) {
            gs.error("CSRGeneratorAjax.generateCSR(): Exception while attaching file");
        }
        return JSON.stringify(responseObj);
    },

    isCSRGenerationEnabled: function() {
        return JSON.stringify(gs.getProperty('sn_disco_certmgmt.enable_csr_generation', false));
    },

    deleteAttachment: function() {
        var attachmentSysId = '' + this.getParameter('sysparm_attachment_sys_id');
        var sysAttach = new GlideRecordSecure('sys_attachment');
        if (sysAttach.get(attachmentSysId) &&
            sysAttach.getValue('file_name') == 'private_key.pem' &&
            sysAttach.getValue('table_name') == 'sc_cart_item') {
            sysAttach.deleteRecord();
        } else {
            gs.error('CSRGeneratorAjax.deleteAttachment(): Unauthorized attempt to delete non-private-key attachment: ' + attachmentSysId);
        }
    },


    type: 'CSRGeneratorAjax'
});
