(function runRecipientScript(/*String*/ parm1, /*String*/ parm2) {
      /*
      //Create instance of AdvancedNotificationRecipients to add recipients
      var nr = new sn_notification.AdvancedNotificationRecipients();
      var sysIds = [];
      var gr = new GlideRecord('sys_user');
      gr.addQuery('first_name','IN',parm1);
      gr.query();
      while (gr.next()) {
        sysIds.push(gr.getValue('sys_id'));
      }
      nr.addRecipientInfo('sys_user',sysIds);
      return nr;*/
      })(parm1,parm2);
