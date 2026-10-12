var AIXExperienceAnalyticsManager = Class.create();
AIXExperienceAnalyticsManager.prototype = {
  initialize: function () {},

  /**
   * Create sys_analytics_app entry for an AIX Experience
   * Called on INSERT
   */
  createAnalyticsApp: function (experienceGr) {
    if (!experienceGr || !experienceGr.isValidRecord()) {
      return;
    }

    // Prevent duplicates
    var existing = new GlideRecord('sys_analytics_app');
    existing.addQuery('app_sys_id', experienceGr.sys_id);
    existing.addQuery('table_name', 'sys_aix_experience');
    existing.query();

    if (existing.hasNext()) {
      return;
    }

    // Create analytics app record
    var app = new GlideRecord('sys_analytics_app');
    app.initialize();

    // Fixed fields (match XML)
    app.active = true;
    app.analytics_channel = 'b46f07e67f0012103ff504866d866575'; // AINativeExperience
    app.enable_unauthenticated_user_tracking = false;
    app.table_name = 'sys_aix_experience';

    // Dynamic fields
    app.app_sys_id = experienceGr.sys_id;
    app.application_name = experienceGr.title;

    app.insert();
  },

  /**
   * Update analytics app name when AIX Experience title changes
   * Called on UPDATE
   */
  updateAnalyticsAppName: function (experienceGr) {
    if (!experienceGr || !experienceGr.isValidRecord()) {
      return;
    }

    var app = new GlideRecord('sys_analytics_app');
    app.addQuery('app_sys_id', experienceGr.sys_id);
    app.addQuery('table_name', 'sys_aix_experience');
    app.query();

    if (app.next()) {
      app.application_name = experienceGr.title;
      app.update();
    }
  },

  type: 'AIXExperienceAnalyticsManager'
};
