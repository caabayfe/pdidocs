// push app sys ids
var FULFILLER_PUSH_APP_SYSID = '05ed2fb177002300258da2e2c81061c2';
var REQUESTOR_PUSH_APP_SYSID = 'ac7f61d273122300d63a566a4cf6a78b';

//mobile client sys ids
var MOBILE_AGENT_SYSID = 'a42d0b0653d033002d96ddeeff7b1200';
var NOW_MOBILE_SYSID = '6fb6c08187403300e0ef0cf888cb0b19';
var NOW_MOBILE_ADMIN_SYSID = '37c052bc5302201024dfddeeff7b12d3';

class NotificationsService {
  constructor(queryParams) {
    this.mobileClientSysId = queryParams.clientSysId
      ? queryParams.clientSysId[0]
      : null;
    this.notifications = [];
    this.oobPushAppSysIds = [
      FULFILLER_PUSH_APP_SYSID,
      REQUESTOR_PUSH_APP_SYSID,
    ];
    this.mobileClientPushAppMap = {
      // mobile agent / fulfiller
      [MOBILE_AGENT_SYSID]: FULFILLER_PUSH_APP_SYSID,
      // now mobile / requestor
      [NOW_MOBILE_SYSID]: REQUESTOR_PUSH_APP_SYSID,
      // now mobile admin / requestor
      [NOW_MOBILE_ADMIN_SYSID]: REQUESTOR_PUSH_APP_SYSID,
    };
  }

  getNativeClientRecordOobPushApp() {
    if (!this.mobileClientSysId) {
      return null;
    }

    var clientGr = new GlideRecord('sys_sg_native_client');
    clientGr.addEncodedQuery('sys_id=' + this.mobileClientSysId);
    clientGr.query();
    if (!clientGr.next()) {
      return null;
    }

    var pushAppSysId = clientGr.getValue('push_application');
    return this.oobPushAppSysIds.includes(pushAppSysId) ? pushAppSysId : null;
  }

  getNotifications() {
    var isFetchingAll = !this.mobileClientSysId;

    var notifM2mGr = new GlideRecord('sys_push_notif_default_reg');
    // filter out records w/o a notification and any associated with mobile classic push apps
    notifM2mGr.addEncodedQuery(
      'sys_event_email_action_idISNOTEMPTY^sys_push_application_id!=ab704041ff1102009738ffffffffff33^sys_push_application_id!=c2abd43253020200601fa3fc9ec5875d'
    );
    if (!isFetchingAll) {
      var oobPushApplication =
        this.mobileClientPushAppMap[this.mobileClientSysId] ||
        this.getNativeClientRecordOobPushApp();
      var pushApps = [];

      var pushAppGr = new GlideRecord('sys_push_application');

      if (!oobPushApplication) {
        var nativeClientGr = new GlideRecord('sys_sg_native_client');
        nativeClientGr.addEncodedQuery('sys_id=' + this.mobileClientSysId);
        nativeClientGr.query();
        if (nativeClientGr.next()) {
          pushAppGr.addEncodedQuery(
            'name=' + nativeClientGr.getValue('type') + 'PushApp'
          );
        } else {
          return [];
        }
      } else {
        pushAppGr.addEncodedQuery(
          'sys_id=' + oobPushApplication + '^NQparent_app=' + oobPushApplication
        );
      }
      pushAppGr.query();
      while (pushAppGr.next()) {
        pushApps.push(pushAppGr.getValue('sys_id'));
      }

      if (pushApps.length) {
        notifM2mGr.addEncodedQuery(
          'sys_push_application_idIN' + pushApps.join(',')
        );
      }
    }
    notifM2mGr.query();
    while (notifM2mGr.next()) {
      this.notifications.push({
        name: notifM2mGr.getDisplayValue('sys_event_email_action_id'),
        sysId: notifM2mGr.getValue('sys_event_email_action_id'),
        sysClassName: 'sysevent_email_action',
        sysClassLabel: gs.getMessage('Notifications'),
        pushApp: notifM2mGr.getDisplayValue('sys_push_application_id'),
        sysUpdatedOn: notifM2mGr.getDisplayValue('sys_updated_on'),
      });
    }

    return this.notifications;
  }
}

module.exports = NotificationsService;
