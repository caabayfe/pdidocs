var ServiceAccountIdValidator = Class.create();
// Regular expression for: Only digits and the length must be 12.
var AWS_VALID_FORMAT = /^[0-9]{12}$/;
// Regular expression for: A valid GUID
var GUID_VALID_FORMAT = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
var DC_AWS = "cmdb_ci_aws_datacenter";
var DC_VCENTER = "cmdb_ci_vcenter_datacenter";
var DC_AZURE = "cmdb_ci_azure_datacenter";

ServiceAccountIdValidator.prototype = {

      initialize: function() {
      },
      validateAccountId: function(accountId, dataCenterType) {
          var validationMsg = "success";
          if (dataCenterType == DC_AWS && !this.isValidAWSAccountId(accountId))
              validationMsg = gs.getMessage("Allowed account ID formats for AWS: A 12-digit number. Eg. 123412341234");
          else if (dataCenterType == DC_VCENTER && !this.isValidVMWareAccountId(accountId))
              validationMsg = gs.getMessage("Not a valid account ID for VMware vCenter.");
          return validationMsg;
      },
      isValidAWSAccountId: function(accountId) {
          return AWS_VALID_FORMAT.test(accountId);
      },
      isValidVMWareAccountId: function(accountId) {
          return GUID_VALID_FORMAT.test(accountId);
      },
      type: 'ServiceAccountIdValidator'
};
