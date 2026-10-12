(function executeRule(current, previous /*null when async*/) {

        updateRootUserCredential();

        function updateRootUserCredential() {
            if (current.value.toLocaleLowerCase().equals("true"))
                createOrUpdateRootCredential();
            else
                deleteRootCredentialIfExists();
        }

        function createOrUpdateRootCredential() {
            var credGr = new GlideRecordSecure('aws_ssm_instance_user_credentials');
            credGr.addQuery('user_name', 'root');
            credGr.setLimit(1);
            credGr.query();
            if (credGr.next()) {
                credGr.active = true;
                credGr.update();
            } else {
                credGr.initialize();
                credGr.name = "Linux SSM Root User";
                credGr.user_name = "root";
                credGr.active = true;
                credGr.order = 99999;
                credGr.insert();
            }
        }

        function deleteRootCredentialIfExists() {
            var credGr = new GlideRecordSecure('aws_ssm_instance_user_credentials');
            credGr.addQuery('user_name', 'root');
            credGr.query();
            if (credGr.hasNext())
                credGr.deleteMultiple();
        }

    })(current, previous);
