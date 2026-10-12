(function executeRule(current, previous /*null when async*/ ) {
        var commonInfoFields = current.common_info_fields + '';
        if (!gs.nil(commonInfoFields) && commonInfoFields.length > 0) {
            var commonInfoFieldsArr = commonInfoFields.split(',');
            if (commonInfoFieldsArr.length > 4) {
                gs.addErrorMessage(gs.getMessage("Common info fields should not be more than 4"));
                current.setAbortAction(true);
            }
        }
    })(current, previous);
