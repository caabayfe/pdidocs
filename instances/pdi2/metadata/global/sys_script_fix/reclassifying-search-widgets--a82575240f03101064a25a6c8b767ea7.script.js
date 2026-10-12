
          // Widgets -  "Homepage Search", "Typeahead", "Faceted Search
          // Add sp_instance sys_id here to reclassify
          var instances = [];

          reclassSearchInstances();
          function reclassSearchInstances() {
            try {
              var gr = new GlideRecord('sp_instance');
              if (!gr.isValid())
                return;
              gr.addQuery('sys_id', 'IN', instances);  
              gr.addQuery('sys_class_name', 'sp_instance');
              gr.query();
              while (gr.next()) {
                  var packageId = gr.sys_package;
                  gr.setValue('sys_class_name', 'sp_instance_ais');
                  gr.autoSysFields(false);
                  gr.setWorkflow(false);
                  gr.update();
                  gr.setValue('sys_package', packageId);
                  gr.update();
              }
            } catch (err) {
              gs.print('Reclassification of Search widgets instances failed with error - ' + err.name + '::' + err.message);
            }}
