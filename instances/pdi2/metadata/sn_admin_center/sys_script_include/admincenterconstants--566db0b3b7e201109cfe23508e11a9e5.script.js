var AdminCenterConstants = Class.create();
AdminCenterConstants.prototype = {
    initialize: function() {},

    APPLICATIONS_TABLE_NAME: 'sn_admin_center_application',

    ADMIN_CENTER_SCOPE: 'sn_admin_center',

    ADOPTION_BLUE_PRINT_SCOPE: 'sn_itsm_bus_obj',

    APPLICATION: 'application',

    MATURITY_GROUP_LITERALS: {
        crawl: {
            name: gs.getMessage('Build the foundation'),
            description: gs.getMessage('Understanding your business critical services and their end-to-end makeup, to provide insight into how IT supports business applications and services')
        },
        walk: {
            name: gs.getMessage('Enhance the experience'),
            description: gs.getMessage('Consolidate, populate and establish data hygiene for the CMDB and foundational data whilst establishing processes to ensure control and visibility of data entering and leaving the CMDB')
        },
        run: {
            name: gs.getMessage('Optimize the functionality'),
            description: gs.getMessage('Consolidate request, incident, problem, and change management on a common platform, connected to the CMDB')
        },
        fly: {
            name: gs.getMessage('Add advanced features'),
            description: gs.getMessage('Make it easier for teams to  understand impact and risk based on actual data. Detect, diagnose, and remediate service issues quickly and accurately')
        }
    },

    type: 'AdminCenterConstants'
};
