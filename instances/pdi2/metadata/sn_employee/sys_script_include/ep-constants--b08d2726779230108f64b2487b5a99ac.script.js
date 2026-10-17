var ep_Constants = Class.create();

ep_Constants.HR_FIELDS = ["employment_start_date", "employment_end_date", "work_phone", "work_mobile", "location_type", "position_type"];

// Scheduled jobs
ep_Constants.JOB_GENERATE_PROFILES_FROM_USERS = "4e996095773330108f64b2487b5a9976";
ep_Constants.JOB_GENERATE_PROFILES_FROM_HR_PROFILES = "4f3112170708c1108d6d78e99cd300bb";

ep_Constants.JOB_DOMAIN_GENERATE_PROFILES_FROM_USERS = "d0b5c81dc3140110069aec4b7d40dd42";
ep_Constants.JOB_DOMAIN_GENERATE_PROFILES_FROM_HR_PROFILES = "b6bb8225c3500110069aec4b7d40dd70";

ep_Constants.prototype = {
    type: 'ep_Constants'
};

ep_Constants.defaultEmployeeProfileBanner = "ae66b33343631210b0de43d488b8f266";

ep_Constants.PUBLIC_FIELD_USER_PREFERENCE = 'employee_profile.public_fields';
ep_Constants.WIDGET_VISIBILITY_USER_PREFERENCE = "employee_profile.widget_visibility";

ep_Constants.OVERRIDABLE_WIDGET_VISIBILITY = ['employee_only', 'employee_and_manager', 'emp_sec_mgrs_and_mgr', 'everyone'];

ep_Constants.ACCESSIBILITY_MSGS = {
    "employee_only": gs.getMessage("only you"),
    "manager_only": gs.getMessage("only your manager"),
    "employee_and_manager": gs.getMessage("you and your manager"),
    "user_criteria": "",
    "everyone": gs.getMessage("everyone"),
    "emp_sec_mgrs_and_mgr": gs.getMessage("you, your manager and other managers")
};

ep_Constants.VISIBILITY_OPTIONS = [{
    "value": "employee_only",
    "label": gs.getMessage("Only you")
}, {
    "value": "employee_and_manager",
    "label": gs.getMessage("You and your manager")
}];

ep_Constants.OOB_PROFILE_TAB_IDS = ["4eb3ab8f774521108f64b2487b5a99aa", "d9c67a7151286510f877a15dbdb67e65", "81d32f8f774521108f64b2487b5a9959", "57d3a3cf774521108f64b2487b5a9925"];
ep_Constants.OOB_DEFAULT_ACTION_GROUP = "5db41e3a534201101865ddeeff7b124c";
ep_Constants.OOB_HEADER_CONFIG = "58e59599c3603110bf4fa78e8740ddda";
ep_Constants.DESKLESS_PORTAL = "3eac14e177333110b4e2ddad7c5a995b";

ep_Constants.ROLES = {
    EMPLOYEE_ADMIN: "sn_employee.admin",
    ESC_ADMIN: "sn_hr_sp.esc_admin",
    ADMIN: "admin"
};
ep_Constants.TABLES = {
    EP_HEADER_CONFIG: {
        NAME: "sn_employee_profile_header_configuration",
        FIELDS: {
            BG_IMAGE: "background_image",
            EDIT_IMAGES: "edit_images",
            SHOW_PRONOUN: "show_pronoun",
            DISABLE_LINKS: "disable_links",
            ACTIONS: "actions",
            DEFAULT: "default",
            USER_NAME_TEMPLATE: 'username_template',
            SECONDARY_INFO_FIELDS: 'secondary_info_fields',
            CHANNEL: 'channel',
            SHOW_PRESENCE: 'show_presence',
            DOMAIN: "sys_domain",
            CREATED: "sys_created_on"
        }
    },
    EP_PORTAL_CONFIG: {
        NAME: "sn_employee_portal_configuration",
        FIELDS: {
            PORTAL: "portal",
            ORDER: "order",
            HEADER_CONFIG: "header_configuration",
            WIDGET_OVERVIEW_PANEL: "side_bar",
            DOMAIN: "sys_domain",
            CREATED: "sys_created_on"
        }
    }
};
