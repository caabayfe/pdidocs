
             (function executeRule(current, previous /*null when async*/) {

            // Display an error if access to the Domain Cleanup feature is not licensed.
            var hasLicense = new global.DomainSeparationLicensingUtil().hasLicense();
            if (!hasLicense) {
                gs.addErrorMessage(gs.getMessage('domain_license_error_message'));
            }

})(current, previous);
