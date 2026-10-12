var SlackUninstallJobScheduler = Class.create();
SlackUninstallJobScheduler.prototype = {
    APP_INSTALLER_SCHEDULD_JOB_NAME: 'Slack App Uninstaller',
    MAX_DELAY_DAY: 30,
    MIN_DELAY_DAY: 1,

    initialize: function() {},

    scheduleUninstallJob: function() {
        var delayDays = this.getDelayDay();
        var delay = new GlideDate();
        delay.addDaysUTC(delayDays);

        var rec = new GlideRecord('sysauto_script');
        if (rec.get('name', this.APP_INSTALLER_SCHEDULD_JOB_NAME)) {
            rec.setValue('run_start', delay);
            rec.setValue('run_as', '6816f79cc0a8016401c5a33be04be441');
            rec.setValue('script', 'new sn_va_slack.VASlackAdapterUninstaller().run();');
            rec.update();
        } else {
            rec.setValue('name', this.APP_INSTALLER_SCHEDULD_JOB_NAME);
            rec.setValue('run_type', 'once');
            rec.setValue('run_start', delay);
            rec.setValue('run_as', '6816f79cc0a8016401c5a33be04be441'); // Run as admin
            rec.setValue('script', 'new sn_va_slack.VASlackAdapterUninstaller().run();');
            rec.insert();
        }
    },

    getDelayDay: function() {
        var delayDays = gs.getProperty("glide.cs.delete_delay_day", 15);
        if (delayDays > this.MAX_DELAY_DAY)
            return this.MAX_DELAY_DAY;

        if (delayDays < this.MIN_DELAY_DAY)
            return this.MIN_DELAY_DAY;

        return delayDays;
    },

    type: 'SlackUninstallJobScheduler'
};
