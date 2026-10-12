/**
 Service-now.com
 
 Description: This business rule reflects the number of computer a particular license is installed on.
**/

calculateManualLicenseCount();

function calculateManualLicenseCount() {
    if (!current.ast_license)
        return;

    new ASTLicense().calcManualManagedInstallCount(current.ast_license);

}
