var notificationUtil = new sn_ex_sp_notifs.PortalNotificationsUtil();
notificationUtil.createReminder(current);
gs.info("Processed reminder creation for notification:" + current.sys_id.toString());
