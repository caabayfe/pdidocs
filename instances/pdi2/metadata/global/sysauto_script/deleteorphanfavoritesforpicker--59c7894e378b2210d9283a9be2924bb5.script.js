
			    
            var favGR = new GlideRecord('sys_hub_favorite_artifacts');
            favGR.query();

            while (favGR.next()) {
                var gr = favGR.artifact_id.getRefRecord();
                if (!gr.isValidRecord()) {
                    gs.info('Deleting orphaned favorite: ' + favGR.getUniqueValue());
                    favGR.deleteRecord();
                }
            }
