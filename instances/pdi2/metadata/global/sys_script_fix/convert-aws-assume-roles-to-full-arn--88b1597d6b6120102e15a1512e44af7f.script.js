(function() {
    gs.info('converting roles names to full ARN');
    convertAssumeRolesToFullARN('cloud_service_account_aws_org_assume_role_params');
    convertAssumeRolesToFullARN('cloud_service_account_aws_cross_assume_role_params');

    function convertAssumeRolesToFullARN(tableName) {
        var gr = new GlideRecord(tableName);
        gr.query();
        while (gr.next()) {
            var accessRoleName = gr.getValue('access_role_name');
            if (!accessRoleName.startsWith('arn:aws')) {
                var accountId = gr.cloud_service_account.account_id + "";
                var fullARNStr = 'arn:aws:iam::' + accountId + ':role/' + accessRoleName;
                gr.setValue('access_role_name', fullARNStr);
                var isUpdated = gr.update();
                if (isUpdated) gs.log("Successfully updated the record with sys_id:: " + gr);
                else gs.log("failed to updated record with sys_id:: " + gr);
            }
        }
    }
})();
