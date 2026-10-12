var IHUsageDailyCapture = Class.create();
  IHUsageDailyCapture.prototype = {
      initialize: function() {},

      capture: function() {
          var today = new GlideDate();
          var todayStr = today.getValue();
          var accrualMonth = todayStr.substring(0, 7);

          gs.info('IHUsageDailyCapture: Running for date=' + todayStr + ', accrualMonth=' + accrualMonth);

          var gr = new GlideRecord('ua_ih_usage');
          gr.addQuery('license_id', 'IntegrationHubPool');
          gr.addQuery('time_stamp', accrualMonth);
          gr.query();

          var insertCount = 0;
          var updateCount = 0;
          var skipCount = 0;

          while (gr.next()) {
              var parentSysId = gr.sys_id.toString();
              // current cumulative for this accrual month
              var currentCount = parseInt(gr.getValue('use_count'), 10) || 0;

              // re-run check - today's row may already exist if job ran earlier
              var existCheck = new GlideRecord('ua_ih_usage_daily');
              existCheck.addQuery('ua_ih_usage', parentSysId);
              existCheck.addQuery('time_stamp', todayStr);
              existCheck.setLimit(1);
              existCheck.query();

              if (existCheck.next()) {
                  // recompute today's delta excluding today's existing row
                  var existingDelta = parseInt(existCheck.getValue('use_count'), 10) || 0;

                  var prevSum = new GlideRecord('ua_ih_usage_daily');
                  prevSum.addQuery('ua_ih_usage', parentSysId);
                  prevSum.addQuery('time_stamp', '!=', todayStr);
                  prevSum.query();
                  var prevSumCount = 0;
                  while (prevSum.next()) {
                      prevSumCount += parseInt(prevSum.getValue('use_count'), 10) || 0;
                  }

                  var newDelta = currentCount - prevSumCount;
                  if (newDelta < 0) newDelta = 0;

                  if (newDelta !== existingDelta) {
                      existCheck.setValue('use_count', newDelta);
                      existCheck.update();
                      updateCount++;
                  } else {
                      skipCount++;
                  }
              } else {
                  // sum all previous daily deltas to derive the prior cumulative
                  var prevAgg = new GlideAggregate('ua_ih_usage_daily');
                  prevAgg.addQuery('ua_ih_usage', parentSysId);
                  prevAgg.addAggregate('SUM', 'use_count');
                  prevAgg.groupBy('ua_ih_usage');
                  prevAgg.query();
                  var prevCount = (prevAgg.next())
                      ? parseInt(prevAgg.getAggregate('SUM', 'use_count'), 10) || 0
                      : 0;

                  // delta = current cumulative - sum of all previously recorded daily deltas
                  var delta = currentCount - prevCount;
                  if (delta < 0) delta = 0;

                  var daily = new GlideRecord('ua_ih_usage_daily');
                  daily.setValue('ua_ih_usage', parentSysId);
                  daily.setValue('time_stamp', todayStr);
                  daily.setValue('use_count', delta);
                  daily.insert();
                  insertCount++;
              }
          }

          gs.info('IHUsageDailyCapture: Done. Inserted=' + insertCount + ', Updated=' + updateCount + ', Skipped=' + skipCount);
      },

      type: 'IHUsageDailyCapture'
  };
