var PwdResetGCFConstants = Class.create();

PwdResetGCFConstants.MAX_BUCKETS_LIMIT = 8;
//Category
PwdResetGCFConstants.CATEGORY = 'pwd_reset';
//Instrumentation Points, Events and Dimensions
PwdResetGCFConstants.CollectionConstants = {
    PasswordResetApp: {
        COLLECTION_POINT_VALUE: 'pwd_reset_app',
        PasswordResetNotifications: {
            COLLECTION_EVENT_VALUE: 'pwd_reset_notif',
            Dimensions: {
                TYPE: 'type'
            }
        }
    }
};
