var record = new GlideRecord("sysauto_script");
if (record.get('1e318661a00ec210f877d142267461f4') && record.run_type == 'on_demand')
    new sn_vsc.CustomerPushActionUtils().scheduleNotificationsDownloadJob();
