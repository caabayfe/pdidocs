(function executeFixScript() {
    try {
        function splitReleaseName(fileName) {
            if (!fileName || typeof fileName !== 'string' || (fileName.indexOf('.war') === -1 && fileName.indexOf('.zip') === -1)) {
                return null;
            }

            var parts = fileName.split('__');
            if (!parts || parts.length === 0) {
                return null;
            }

            var meta = parts[0]; // e.g. glide-xanadu-07-02-2024 or glide-trackadminx-11-12-2021
            if (!meta) {
                return null;
            }
            
            var patchPart = parts[1] || ''; // patch1-hotfix2-... or missing

            var metaParts = meta.split('-');
            if (!metaParts || metaParts.length < 2) {
                return null;
            }

            var family = capitalize(metaParts[1]);
            if (!family) {
                return null;
            }

            // Safe check for patchPart before using indexOf
            if (patchPart && typeof patchPart === 'string' && patchPart.indexOf('patchrtp') === 0) {
                return family + ' RTP';
            }

            // Only attempt to match if patchPart exists and is a string
            var match = (patchPart && typeof patchPart === 'string') ? patchPart.match(/(patch\d+[a-z]?)(-hotfix\d+[a-z]?)?/i) : null;
            if (match) {
                var patchLabel = match[1]; // patch1, patch1a, etc.
                var hotfixLabel = match[2] || ''; // -hotfix2a

                if (patchLabel === 'patch0' && !hotfixLabel) {
                    return family; // Base version
                }

                var name = family;

                if (patchLabel !== 'patch0') {
                    name += ' ' + (patchLabel.replace('patch', 'Patch '));
                }

                if (hotfixLabel) {
                    name += ' ' + (hotfixLabel.replace('-hotfix', 'Hotfix '));
                }

                return name;
            }

            // If no patch part is present or doesn't match expected format
            return family;
        }

        function capitalize(str) {
            if (!str || typeof str !== 'string') {
                return '';
            }
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        }

        gs.info('Executing Fix Script: Checking sn_um_instance_status table');

        // First check if the table exists
        if (!gs.tableExists('sn_um_instance_status')) {
            gs.error('Table sn_um_instance_status does not exist. Skipping fix script execution.');
            return;
        }

        var glideVersion = gs.getProperty('glide.war');
        if (!glideVersion) {
            gs.info('glide.war property is null or empty, returning from fix script');
            return;
        }
        
        var releaseName = splitReleaseName(glideVersion);
        if (!releaseName) {
            releaseName = glideVersion;
            gs.info('Could not parse release name from ' + glideVersion + ', using: ' + releaseName);
        }
        
        var instanceId = gs.getProperty('instance_id');
        if (!instanceId) {
            gs.error('Could not retrieve instance_id property. Skipping fix script execution.');
            return;
        }

        try {
            // Check if record exists - with explicit error handling
            var instanceStatusGR = new GlideRecord('sn_um_instance_status');
            if (!instanceStatusGR.isValid()) {
                gs.error('GlideRecord for sn_um_instance_status is not valid. Skipping fix script execution.');
                return;
            }
            
            instanceStatusGR.addQuery('instance_id', instanceId);
            instanceStatusGR.query();

            // If no records exist, create one
            if (!instanceStatusGR.hasNext()) {
                try {
                    gs.info('No record found in sn_um_instance_status table. Creating a new record.');
                    var newRecord = new GlideRecord('sn_um_instance_status');
                    if (!newRecord.isValid()) {
                        gs.error('Failed to create valid GlideRecord for sn_um_instance_status. Skipping record creation.');
                        return;
                    }
                    
                    newRecord.initialize();
                    newRecord.setValue('instance_id', instanceId);
                    newRecord.setValue('current_version', releaseName);
                    newRecord.setValue('upgrade_status', 'Not scheduled');
                    newRecord.setValue('last_clone', '-');
                    
                    // Check if all required fields are set
                    var sysId = newRecord.insert();
                    
                    if (sysId) {
                        gs.info('Record created successfully with sys_id: ' + sysId);
                    } else {
                        gs.error('Failed to create record in sn_um_instance_status table. Error: ' + gs.getErrorMessage());
                    }
                } catch (insertError) {
                    gs.error('Exception occurred while inserting record: ' + insertError);
                }
            } else {
                // Update the current version
                try {
                    if (instanceStatusGR.next()) {
                        gs.info('Record already exists in sn_um_instance_status table. Updating the current version.');
                        instanceStatusGR.setValue('current_version', releaseName);
                        instanceStatusGR.update();
                        gs.info("Updating current_version to: " + releaseName);
                    } else {
                        gs.error('Failed to retrieve next record from GlideRecord result set.');
                    }
                } catch (updateError) {
                    gs.error('Exception occurred while updating record: ' + updateError);
                }
            }
        } catch (grError) {
            gs.error('Exception occurred during GlideRecord operations: ' + grError);
        }
    } catch (e) {
        gs.error('Exception in fix script: ' + e);
    }
})();
