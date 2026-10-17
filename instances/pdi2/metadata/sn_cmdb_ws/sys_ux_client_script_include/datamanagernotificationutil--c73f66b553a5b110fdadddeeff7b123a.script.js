function include({
    imports
}) {
    const POLICY_NOTIFICATION_MSG_CODES = {
        POLICY_PUBLISH_SUCCESS: 'POLICY_PUBLISH_SUCCESS',
        POLICY_SAVE_SUCCESS: 'POLICY_SAVE_SUCCESS',
        PUBLISH_POLICY_READ_ONLY: 'PUBLISH_POLICY_READ_ONLY',
        DELETE_DRAFT_POLICIES_SUCCESS: 'DELETE_DRAFT_POLICIES_SUCCESS',
        DELETE_DRAFT_POLICIES_ACTION_SCHEDULED: 'DELETE_DRAFT_POLICIES_ACTION_SCHEDULED',
        DELETE_DEACTIVATED_POLICIES_SUCCESS: 'DELETE_DEACTIVATED_POLICIES_SUCCESS',
        DELETE_DEACTIVATED_POLICIES_ACTION_SCHEDULED: 'DELETE_DEACTIVATED_POLICIES_ACTION_SCHEDULED'
    };
    const TASK_NOTIFICATION_MSG_CODES = {
        TASK_APPR_SUCCESS: 'TASK_APPR_SUCCESS',
        TASK_CANCEL_SUCCESS: 'TASK_CANCEL_SUCCESS',
        TASK_REJECT_SUCCESS: 'TASK_REJECT_SUCCESS',
        TASK_SUBMIT_SUCCESS: 'TASK_SUBMIT_SUCCESS'
    };
    const EXCLUSION_NOTIFICATION_MSG_CODES = {
        SAVE_EXCLUSION_LIST_SUCCESS: 'SAVE_EXCLUSION_LIST_SUCCESS',
        SAVE_EXCLUSION_LIST_QUEUED: 'SAVE_EXCLUSION_LIST_QUEUED'
    };
    const SETTINGS_MSG_CODES = {
        SAVE_SETTINGS_SUCCESS: 'SAVE_SETTINGS_SUCCESS',
        RESET_TO_DEFAULT_SETTINGS_SUCCESS: 'RESET_TO_DEFAULT_SETTINGS_SUCCESS'
    };
    const RETIREMENT_DEF_MSG_CODES = {
        CREATE_DEF_SUCCESS: 'CREATE_DEF_SUCCESS',
        UPDATE_DEF_SUCCESS: 'UPDATE_DEF_SUCCESS',
        DELETE_DEF_SUCCESS: 'DELETE_DEF_SUCCESS'
    };

    const _getNotificationMsg = async (helpers, code) => {
        switch (code) {
            case TASK_NOTIFICATION_MSG_CODES.TASK_APPR_SUCCESS:
                return await helpers.translate("Task approved successfully.");
            case TASK_NOTIFICATION_MSG_CODES.TASK_CANCEL_SUCCESS:
               return await helpers.translate("Task cancelled successfully.");
           case TASK_NOTIFICATION_MSG_CODES.TASK_REJECT_SUCCESS:
               return await helpers.translate("Task rejected successfully.");
            case TASK_NOTIFICATION_MSG_CODES.TASK_SUBMIT_SUCCESS:
               return await helpers.translate("Task submitted successfully.");
           case POLICY_NOTIFICATION_MSG_CODES.POLICY_PUBLISH_SUCCESS:
               return await helpers.translate("Policy published successfully.");
           case EXCLUSION_NOTIFICATION_MSG_CODES.SAVE_EXCLUSION_LIST_SUCCESS:
               return await helpers.translate("Exclusion list saved successfully.");
            case EXCLUSION_NOTIFICATION_MSG_CODES.SAVE_EXCLUSION_LIST_QUEUED:
                return await helpers.translate("Updating the exclusion list will take some time. The list can be reviewed after a few minutes.")
            case POLICY_NOTIFICATION_MSG_CODES.POLICY_SAVE_SUCCESS:
               return await helpers.translate("Policy saved successfully.");
           case SETTINGS_MSG_CODES.SAVE_SETTINGS_SUCCESS:
               return await helpers.translate("Settings saved successfully.");
           case SETTINGS_MSG_CODES.RESET_TO_DEFAULT_SETTINGS_SUCCESS:
               return await helpers.translate("Settings reset to default successfully.");
           case POLICY_NOTIFICATION_MSG_CODES.PUBLISH_POLICY_READ_ONLY:
                return await helpers.translate("Published policies cannot be edited. Deactivate the policy to edit it.");
           case RETIREMENT_DEF_MSG_CODES.CREATE_DEF_SUCCESS:
               return await helpers.translate("Retirement definition successfully created.");
           case RETIREMENT_DEF_MSG_CODES.UPDATE_DEF_SUCCESS:
               return await helpers.translate("Retirement definition successfully updated.");
           case RETIREMENT_DEF_MSG_CODES.DELETE_DEF_SUCCESS:
               return await helpers.translate("Retirement definition successfully deleted.");
           case POLICY_NOTIFICATION_MSG_CODES.DELETE_DRAFT_POLICIES_SUCCESS:
                return await helpers.translate("Draft policies were deleted successfully.");
           case POLICY_NOTIFICATION_MSG_CODES.DELETE_DRAFT_POLICIES_ACTION_SCHEDULED:
                return await helpers.translate("The draft policies you selected have been marked for deletion. These will be deleted in the background and take some time to complete.");
           case POLICY_NOTIFICATION_MSG_CODES.DELETE_DEACTIVATED_POLICIES_SUCCESS:
                return await helpers.translate("De-activated policies were deleted successfully.");
           case POLICY_NOTIFICATION_MSG_CODES.DELETE_DEACTIVATED_POLICIES_ACTION_SCHEDULED:
                return await helpers.translate("The de-activated policies you selected have been marked for deletion. These will be deleted in the background and take some time to complete.");
        }
    };

    return {
        POLICY_NOTIFICATION_MSG_CODES,
        TASK_NOTIFICATION_MSG_CODES,
        EXCLUSION_NOTIFICATION_MSG_CODES,
        SETTINGS_MSG_CODES,
        RETIREMENT_DEF_MSG_CODES,
        getNotificationMsg: _getNotificationMsg
    };
}
