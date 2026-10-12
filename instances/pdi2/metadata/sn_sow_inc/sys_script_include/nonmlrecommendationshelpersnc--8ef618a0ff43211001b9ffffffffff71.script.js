var NonMLRecommendationsHelperSNC = Class.create();
NonMLRecommendationsHelperSNC.prototype = {
    initialize: function() {},

    getSimilarOpenPRBsWithFilters: function(incidentGR) {
        var similarPRBsSysIds = [];
        if (incidentGR) {
            var configItem = incidentGR.cmdb_ci;
            var service = incidentGR.business_service;

            // Execute script only if CI or service has value
            if (!gs.nil(configItem) || !gs.nil(service)) {
                // Find similar problem records with the same configItem and service
                var similarPRBsGR = new GlideRecord('problem');
                similarPRBsGR.addQuery('state', 'NOT IN', '106,107'); // Query for Problems that are not in Resolved or Closed State
                similarPRBsGR.addQuery('cmdb_ci', configItem);
                similarPRBsGR.addQuery('business_service', service);
                similarPRBsGR.addQuery('sys_created_on', '>=', gs.daysAgoStart(7)); // Query for problem records created in the last 7 days
                similarPRBsGR.orderByDesc('sys_created_on'); // Order the result by the latest created on top
                similarPRBsGR.setLimit(5); // Limit the result to top 5 records
                similarPRBsGR.query();

                while (similarPRBsGR.next()) {
                    similarPRBsSysIds.push(similarPRBsGR.getUniqueValue());
                }

                // If fewer than 5 records are found, find additional records with matching configItem or service
                if (similarPRBsSysIds.length < 5) {
                    var additionalSimilarPRBsGR = new GlideRecord('problem');
                    additionalSimilarPRBsGR.addQuery('state', 'NOT IN', '106,107');
                    additionalSimilarPRBsGR.addQuery('sys_created_on', '>=', gs.daysAgoStart(7));
                    additionalSimilarPRBsGR.addQuery('sys_id', 'NOT IN', similarPRBsSysIds.join(','));
                    if (!gs.nil(configItem) && !gs.nil(service)) {
                        additionalSimilarPRBsGR.addQuery('cmdb_ci', configItem).addOrCondition('business_service', service);
                    } else if (!gs.nil(configItem)) {
                        additionalSimilarPRBsGR.addQuery('cmdb_ci', configItem)
                    } else if (!gs.nil(service)) {
                        additionalSimilarPRBsGR.addQuery('business_service', service)
                    }
                    additionalSimilarPRBsGR.orderByDesc('sys_created_on');
                    additionalSimilarPRBsGR.setLimit(5 - similarPRBsSysIds.length);
                    additionalSimilarPRBsGR.query();

                    while (additionalSimilarPRBsGR.next()) {
                        similarPRBsSysIds.push(additionalSimilarPRBsGR.getUniqueValue());
                    }
                }

                return similarPRBsSysIds;
            }
        }

        return null;
    },

    getSimilarResolvedIncidentsWithFilters: function(incidentGR) {
        var similarIncidentsSysIds = [];
        if (incidentGR) {
            var configItem = incidentGR.cmdb_ci;
            var service = incidentGR.business_service;

            // Execute script only if CI or service has value
            if (!gs.nil(configItem) || !gs.nil(service)) {
                // Find similar incident records with the same configItem and service
                var similarIncidentsGR = new GlideRecord('incident');
                similarIncidentsGR.addQuery('cmdb_ci', configItem);
                similarIncidentsGR.addQuery('business_service', service);
                similarIncidentsGR.addQuery('sys_created_on', '>=', gs.monthsAgo(6)); // Query for past 6 months
                similarIncidentsGR.addQuery('state', 'IN', '6,7'); // Query for resolved or closed incidents
                similarIncidentsGR.addNullQuery('parent_incident'); // Query for incidents that are not a child incident
                similarIncidentsGR.orderByDesc('sys_created_on'); // Order by latest on top
                similarIncidentsGR.setLimit(5); // Return top 5 results
                similarIncidentsGR.query();

                while (similarIncidentsGR.next()) {
                    similarIncidentsSysIds.push(similarIncidentsGR.getUniqueValue());
                }

                // If fewer than 5 records are found, find additional records with matching configItem or service
                if (similarIncidentsSysIds.length < 5) {
                    var additionalSimilarIncidentsGR = new GlideRecord('incident');
                    additionalSimilarIncidentsGR.addQuery('sys_id', 'NOT IN', similarIncidentsSysIds.join(','));
                    additionalSimilarIncidentsGR.addQuery('sys_created_on', '>=', gs.monthsAgo(6));
                    additionalSimilarIncidentsGR.addQuery('state', 'IN', '6,7');
                    additionalSimilarIncidentsGR.addNullQuery('parent_incident');
                    if (!gs.nil(configItem) && !gs.nil(service)) {
                        additionalSimilarIncidentsGR.addQuery('cmdb_ci', configItem).addOrCondition('business_service', service);
                    } else if (!gs.nil(configItem)) {
                        additionalSimilarIncidentsGR.addQuery('cmdb_ci', configItem)
                    } else if (!gs.nil(service)) {
                        additionalSimilarIncidentsGR.addQuery('business_service', service)
                    }
                    additionalSimilarIncidentsGR.orderByDesc('sys_created_on');
                    additionalSimilarIncidentsGR.setLimit(5 - similarIncidentsSysIds.length);
                    additionalSimilarIncidentsGR.query();

                    while (additionalSimilarIncidentsGR.next()) {
                        similarIncidentsSysIds.push(additionalSimilarIncidentsGR.getUniqueValue());
                    }
                }

                return similarIncidentsSysIds;
            }
        }

        return null;
    },

    getSimilarOpenIncidentsWithFilters: function(incidentGR) {
        var similarIncidentsSysIds = [];
        if (incidentGR) {
            var configItem = incidentGR.cmdb_ci;
            var service = incidentGR.business_service;

            // Execute script only if CI or service has value
            if (!gs.nil(configItem) || !gs.nil(service)) {
                // Find similar incidents with the same configItem and service
                var similarIncidentsGR = new GlideRecord('incident');
                similarIncidentsGR.addQuery('state', 'IN', '1,2,3'); // Query for New, In Progress, and On Hold incidents
                similarIncidentsGR.addQuery('cmdb_ci', configItem);
                similarIncidentsGR.addQuery('business_service', service);
                similarIncidentsGR.addQuery('sys_created_on', '>=', gs.monthsAgo(6)); // Query for past 6 months
                similarIncidentsGR.addNullQuery('parent_incident'); // Query for incidents that are not a child incident
                similarIncidentsGR.addQuery('sys_id', '!=', incidentGR.getUniqueValue()); // Exclude the current incident
                similarIncidentsGR.orderByDesc('sys_created_on'); // Order by latest on top
                similarIncidentsGR.setLimit(5); // Return top 5 results
                similarIncidentsGR.query();

                while (similarIncidentsGR.next()) {
                    similarIncidentsSysIds.push(similarIncidentsGR.getUniqueValue());
                }

                // If fewer than 5 records are found, find additional records with matching configItem or service
                if (similarIncidentsSysIds.length < 5) {
                    var additionalSimilarIncidentsGR = new GlideRecord('incident');
                    additionalSimilarIncidentsGR.addQuery('state', 'IN', '1,2,3');
                    additionalSimilarIncidentsGR.addQuery('sys_created_on', '>=', gs.monthsAgo(6));
                    additionalSimilarIncidentsGR.addNullQuery('parent_incident');
                    additionalSimilarIncidentsGR.addQuery('sys_id', 'NOT IN', similarIncidentsSysIds.join(',') + ',' + incidentGR.getUniqueValue());
                    if (!gs.nil(configItem) && !gs.nil(service)) {
                        additionalSimilarIncidentsGR.addQuery('cmdb_ci', configItem).addOrCondition('business_service', service);
                    } else if (!gs.nil(configItem)) {
                        additionalSimilarIncidentsGR.addQuery('cmdb_ci', configItem)
                    } else if (!gs.nil(service)) {
                        additionalSimilarIncidentsGR.addQuery('business_service', service)
                    }
                    additionalSimilarIncidentsGR.orderByDesc('sys_created_on');
                    additionalSimilarIncidentsGR.setLimit(5 - similarIncidentsSysIds.length);
                    additionalSimilarIncidentsGR.query();

                    while (additionalSimilarIncidentsGR.next()) {
                        similarIncidentsSysIds.push(additionalSimilarIncidentsGR.getUniqueValue());
                    }
                }

                return similarIncidentsSysIds;
            }
        }

        return null;
    },

    type: 'NonMLRecommendationsHelperSNC'
};
