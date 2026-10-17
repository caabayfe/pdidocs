var AisMigrationFacetGenerator = Class.create();
AisMigrationFacetGenerator.prototype = {

    FACET_LOOKUPS: {
        'incident': [{
                'name': 'priority',
                'label': 'Priority',
                'ais_facet_name': 'incident.priority',
                'order': '100'
            },
            {
                'name': 'state',
                'label': 'State',
                'ais_facet_name': 'incident.state',
                'order': '200'
            },
            {
                'name': 'category',
                'label': 'Category',
                'ais_facet_name': 'incident.category',
                'order': '300'
            },
            {
                'name': 'assignment_group',
                'label': 'Assignment Group',
                'ais_facet_name': 'incident.assignment_group',
                'order': '400'
            }
        ],
        'change_request': [{
                'name': 'type',
                'label': 'Type',
                'ais_facet_name': 'change_request.type',
                'order': '100'
            },
            {
                'name': 'assignment_group',
                'label': 'Assignment Group',
                'ais_facet_name': 'change_request.assignment_group',
                'order': '200'
            },
            {
                'name': 'state',
                'label': 'State',
                'ais_facet_name': 'change_request.state',
                'order': '300'
            },
            {
                'name': 'risk',
                'label': 'Risk',
                'ais_facet_name': 'change_request.risk',
                'order': '400'
            },
            {
                'name': 'priority',
                'label': 'Priority',
                'ais_facet_name': 'change_request.priority',
                'order': '500'
            }
        ],
        'change_task': [{
                'name': 'state',
                'label': 'State',
                'ais_facet_name': 'change_task.state',
                'order': '100'
            },
            {
                'name': 'assignment_group',
                'label': 'Assignment Group',
                'ais_facet_name': 'change_task.assignment_group',
                'order': '200'
            }
        ],
        'problem': [{
                'name': 'state',
                'label': 'State',
                'ais_facet_name': 'problem.state',
                'order': '100'
            },
            {
                'name': 'assignment_group',
                'label': 'Assignment Group',
                'ais_facet_name': 'problem.assignment_group',
                'order': '200'
            },
            {
                'name': 'category',
                'label': 'Category',
                'ais_facet_name': 'problem.category',
                'order': '300'
            }
        ],
        'sc_request': [{
                'name': 'requested_for',
                'label': 'Requested For',
                'ais_facet_name': 'sc_request.requested_for',
                'order': '100'
            },
            {
                'name': 'state',
                'label': 'State',
                'ais_facet_name': 'sc_request.state',
                'order': '200'
            },
            {
                'name': 'opened_by',
                'label': 'Opened By',
                'ais_facet_name': 'sc_request.opened_by',
                'order': '300'
            }
        ],
        'sc_req_item': [{
                'name': 'state',
                'label': 'State',
                'ais_facet_name': 'sc_req_item.state',
                'order': '100'
            },
            {
                'name': 'requested_for',
                'label': 'Requested For',
                'ais_facet_name': 'sc_req_item.requested_for',
                'order': '200'
            },
            {
                'name': 'opened_by',
                'label': 'Opened By',
                'ais_facet_name': 'sc_req_item.opened_by',
                'order': '300'
            }
        ],
        'sc_task': [{
                'name': 'priority',
                'label': 'Priority',
                'ais_facet_name': 'sc_task.priority',
                'order': '100'
            },
            {
                'name': 'state',
                'label': 'State',
                'ais_facet_name': 'sc_task.state',
                'order': '200'
            },
            {
                'name': 'assignment_group',
                'label': 'Assignment Group',
                'ais_facet_name': 'sc_task.assignment_group',
                'order': '300'
            },
            {
                'name': 'request_item',
                'label': 'Request Item',
                'ais_facet_name': 'sc_task.request_item',
                'order': '400'
            }
        ],
        'sys_user': [{
                'name': 'company',
                'label': 'Company',
                'ais_facet_name': 'sys_user.company',
                'order': '100'
            },
            {
                'name': 'department',
                'label': 'Department',
                'ais_facet_name': 'sys_user.department',
                'order': '200'
            },
            {
                'name': 'title',
                'label': 'Title',
                'ais_facet_name': 'sys_user.title',
                'order': '300'
            }
        ],
        'sys_user_group': [{
            'name': 'type',
            'label': 'Type',
            'ais_facet_name': 'sys_user_group.type',
            'order': '100'
        }],
        'kb_knowledge': [{
            'name': 'category',
            'label': 'Category',
            'ais_facet_name': 'kb_knowledge.kb_category',
            'order': '100'
        }],
        'sc_cat_item': [{
            'name': 'category',
            'label': 'Category',
            'ais_facet_name': 'sc_cat_item.category',
            'order': '100'
        }],
        'core_company': [{
            'name': 'city',
            'label': 'City',
            'ais_facet_name': 'core_company.city',
            'order': '100'
        }]
    },

    initialize: function(migrationSysID) {
        this.migrationSysID = migrationSysID;
        this.logger = new AisMigrationLogger(migrationSysID, 'FacetGenerator');
    },

    generate: function(context, searchSources) {
        for (var i in searchSources) {
            var searchSourceObj = searchSources[i];

            // Get all the expected facets for current table from the lookup object
            var lookupObj = this.FACET_LOOKUPS[searchSourceObj.table];
            if (lookupObj) {
                for (var j in lookupObj) {
                    var fieldObj = lookupObj[j];

                    // Check that the facet does not exist yet
                    var facetGr = new GlideRecord('sys_search_facet');
                    facetGr.addQuery('search_context_config', context);
                    facetGr.addQuery('ais_facet_name', fieldObj.ais_facet_name);
                    facetGr.query();
                    if (facetGr.hasNext())
                        continue;

                    var aisMigrationRecord = new AisMigrationRecord(this.migrationSysID, 'sys_search_facet');
                    aisMigrationRecord.setValue('search_context_config', context);
                    aisMigrationRecord.setValue('ais_facet_name', fieldObj.ais_facet_name);
                    aisMigrationRecord.setValue('name', fieldObj.name);
                    aisMigrationRecord.setValue('label', fieldObj.label);
                    aisMigrationRecord.setValue('order', fieldObj.order);
                    aisMigrationRecord.setValue('option_limit', '10');

                    aisMigrationRecord.insert();
                }
            }
        }
    },

    type: 'AisMigrationFacetGenerator'
};
