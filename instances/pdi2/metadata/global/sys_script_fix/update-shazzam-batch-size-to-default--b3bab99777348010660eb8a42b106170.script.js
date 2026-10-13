
      var scheduleGR = new GlideRecord('discovery_schedule');
      scheduleGR.addQuery('shazzam_batch_size', 5000);
      scheduleGR.setValue('shazzam_batch_size', 1000);
      scheduleGR.updateMultiple();
      gs.log("Replaced shazzam_batch_size to 1000 from 5000");
