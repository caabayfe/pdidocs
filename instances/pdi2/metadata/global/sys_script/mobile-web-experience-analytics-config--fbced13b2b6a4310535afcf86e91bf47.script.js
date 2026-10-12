(function executeRule(current, previous /*null when async*/) {

      // 1. Schema safety check for aiux_web_experience
      var webExp = current.getValue('aiux_web_experience');
      if (!webExp) {
          return;
      }

      // 2. Locate parent analytics app using GlideRecordSecure
      var analyticsAppGr = new GlideRecordSecure('sys_analytics_app');
      analyticsAppGr.addQuery('app_sys_id', current.sys_id);
      analyticsAppGr.query();
      if (!analyticsAppGr.next()) {
          return;
      }
      var parentAppSysId = analyticsAppGr.getUniqueValue();

      var platforms = ['ios', 'android'];

      // 3. Upsert configuration records using GlideRecordSecure
      for (var i = 0; i < platforms.length; i++) {
          var targetPlatform = platforms[i];

          var configGr = new GlideRecordSecure('sys_analytics_app_config');
          configGr.addQuery('sys_analytics_app', parentAppSysId);
          configGr.addQuery('platform', targetPlatform);
          configGr.query();

          if (configGr.next()) {
              configGr.setValue('customer_override_configuration',
                  withWebEventsEnabled(configGr.getValue('customer_override_configuration')));
              configGr.update();
          } else {
              configGr.initialize();
              configGr.setValue('sys_analytics_app', parentAppSysId);
              configGr.setValue('platform', targetPlatform);
              configGr.setValue('customer_override_configuration', withWebEventsEnabled(null));
              configGr.insert();
          }
      }

      function withWebEventsEnabled(existingJson) {
          var overrides = parseOverrides(existingJson);
          overrides.SendWebEventsToMobile = true;
          return JSON.stringify(overrides);
      }

      function parseOverrides(existingJson) {
          if (!existingJson) {
              return {};
          }

          try {
              var parsed = JSON.parse(existingJson);
              if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                  return parsed;
              }
          } catch (e) {
              gs.info('Failed to parse sys_analytics_app_config.customer_override_configuration, falling back to empty object.');
          }

          return {};
      }
  })(current, previous);
