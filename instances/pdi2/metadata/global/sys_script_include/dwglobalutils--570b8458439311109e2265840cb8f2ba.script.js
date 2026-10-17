var DWGlobalUtils = Class.create();
    DWGlobalUtils.prototype = {
        initialize: function() {},
        dropIndex: function() {
            // Drop existing index
                var droppedCount = new GlideIndexUtils().dropByExactElementSequence("sn_atf_tg_sn_boq", false, ["root_tracker_id"]);
                if (droppedCount > 0) {
                    gs.info("Dropped non-unique index on sn_atf_tg_sn_boq.root_tracker_id");
                }
                
            // Update index to be unique iff it is not currently
            var dict = new GlideRecord('sys_dictionary');
            dict.addQuery("name", "sn_atf_tg_sn_boq");
            dict.addQuery("element", "root_tracker_id");
            dict.addQuery("unique", "false");
            dict.query();
            
            if (dict.next()) {
                dict.setValue("unique", "true");
                dict.updateMultiple();
                gs.info("Updated sys_dictionary to make sn_atf_tg_sn_boq.root_tracker_id unique");
            }
            
            // Create index on element
            gs.ensureIndex("sn_atf_tg_sn_boq", "root_tracker_id");
          },
          cancelJobs: function() {
            // This script is intended to update the snboq table on old store-apps to have a unique index enforced on root_tracker_id
            // This is needed b/c an index already existed on the root_tracker_id which needs to be replaced
            gs.info("Running fix script to update index to be unique on existing store apps");
            gs.info("This will cause running jobs to be cancelled and all snboq records to be deleted");
            
            var testGenQualifiedName = "@dotwalk/atf-bootstrap/TestGenerationSNBOQJob";
            var testRunQualifiedName = "@dotwalk/atf-test-runner-server/TestRunSNBOQJob";
            
            // Cancel any running jobs
            gs.info("Cancelling all running jobs");
            var gr = new GlideRecord("sn_atf_tg_sn_boq");
            gr.addQuery("state", "!=", "completed");
            gr.addQuery("state", "!=", "failed");
            gr.query();
            
            while (gr.next()) {
                var sysId = gr.getValue("sys_id");
                var qualifiedName = gr.getValue("job_qualified_name");
                if (qualifiedName == testRunQualifiedName) {
                    gs.info("Cancelling job with id " + sysId);
                    new SNBOQCleanup().cancelTestRun(sysId, "Updating index to be unique - cancelling all jobs");
                }
                else if (qualifiedName == testGenQualifiedName) {
                    gs.info("Cancelling job with id " + sysId);
                    new SNBOQCleanup().cancelTestGen(sysId, "Updating index to be unique - cancelling all jobs");
                }
              }
            },
        type: 'DWGlobalUtils'
    };
