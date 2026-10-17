/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {

    var consolesObj = {
        "consoles": [{
                "sectionTitle": helpers.translateSync("Posture"),
                "description": helpers.translateSync("Maintain the best security posture with an instance-wide dashboard and guided Best Practices."),
                "link": "/now/security-center-posture/overview",
                "title": helpers.translateSync("Posture"),
                "target": "_self",
                "tools": [{
                        "description": helpers.translateSync("Browse general and specialized solutions that help ensure your instance is secure."),
                        "icon": "sn_vsc.fire.svg",
                        "link": "<style type=\"text/css\">a:hover {background-color:RGB(var(--now-color--primary-1,30,133,109),var(--now-opacity--least,0.1));}</style><a style=\"width: 100%; height: 100%; display: inline-block; margin: 0px; padding: 0px; color: transparent;\" href=\"/now/security-center-posture/best_practices_home\" rel=\"noopener\"><p>" + helpers.translateSync("Link to best practices") + "</p></a>",
                        "title": helpers.translateSync("Best practices")
                    },
                    {
                        "description": helpers.translateSync("See key performance indicators that give insights into the security and activity on your instance."),
                        "icon": "sn_vsc.phone.svg",
                        "link": "<style type=\"text/css\">a:hover {background-color:RGB(var(--now-color--primary-1,30,133,109),var(--now-opacity--least,0.1));}</style><a style=\"width: 100%; height: 100%; display: inline-block; margin: 0px; padding: 0px; color: transparent;\" href=\"/now/security-center-posture/security_dashboard\" rel=\"noopener\"><p>" + helpers.translateSync("Link to security posture dashboard") + "</p></a>",
                        "title": helpers.translateSync("Security posture dashboards")
                    }
                ]
            },
            {
                "sectionTitle": helpers.translateSync("Configuration"),
                "description": helpers.translateSync("Analyze access findings and understand access configurations with access analyzer insights."),
                "link": "now/access-management/overview/params/prevPage/security_center",
                "title": helpers.translateSync("Access management"),
                "target": "_self",
                "tools": [{
                        "description": helpers.translateSync("Review access issues and misconfigurations in your instance."),
                        "icon": "sn_vsc.key-user.svg",
                        "link": "<style type=\"text/css\">a:hover {background-color:RGB(var(--now-color--primary-1,30,133,109),var(--now-opacity--least,0.1));}</style><a style=\"width: 100%; height: 100%; display: inline-block; margin: 0px; padding: 0px; color: transparent;\" href=\"/now/access-management/access_findings/params/prevPage/security_center\" rel=\"noopener\"><p>" + helpers.translateSync("Link to Access findings") + "</p></a>",
                        "title": helpers.translateSync("Access findings")
                    },
                    {
                        "description": helpers.translateSync("Analyze and view permissions for the selected user, role, or group on ServiceNow."),
                        "icon": "sn_vsc.user-hand.svg",
                        "link": "<style type=\"text/css\">a:hover {background-color:RGB(var(--now-color--primary-1,30,133,109),var(--now-opacity--least,0.1));}</style><a style=\"width: 100%; height: 100%; display: inline-block; margin: 0px; padding: 0px; color: transparent;\" href=\"/now/access-management/access-analyzer/params/prevPage/security_center\" rel=\"noopener\"><p>" + helpers.translateSync("Link to Access analyzer") + "</p></a>",
                        "title": helpers.translateSync("Access analyzer")
                    },
                    {
                        "description": helpers.translateSync("Manage scripting capabilities for all users on the platform.."),
                        "icon": "sn_vsc.gear-chat.svg",
                        "link": "<style type=\"text/css\">a:hover {background-color:RGB(var(--now-color--primary-1,30,133,109),var(--now-opacity--least,0.1));}</style><a style=\"width: 100%; height: 100%; display: inline-block; margin: 0px; padding: 0px; color: transparent;\" target=\"_blank\" href=\"/now/scripting-governance-tool/home\" rel=\"noopener\"><p>" + helpers.translateSync("Link to Scripting governance for default group") + "</p></a>",
                        "title": helpers.translateSync("Scripting governance for default group")
                    }
                ]
            },
            {
                "sectionTitle": "",
                "title": helpers.translateSync("Machine identity"),
                "description": helpers.translateSync("Manage service accounts and third-party integrations."),
                "link": "/now/machine-identity-console/home",
                "target": "_blank",
                "tools": [{
                        "description": helpers.translateSync("View and manage OAuth inbound integrations to enable secure connectivity from external systems into ServiceNow."),
                        "icon": "sn_vsc.window-code.svg",
                        "link": "<style type=\"text/css\">a:hover {background-color:RGB(var(--now-color--primary-1,30,133,109),var(--now-opacity--least,0.1));}</style><a style=\"width: 100%; height: 100%; display: inline-block; margin: 0px; padding: 0px; color: transparent;\" target=\"_blank\" href=\"/now/machine-identity-console/inbound-integrations/1755123137658\" rel=\"noopener\"><p>" + helpers.translateSync("Link to Inbound integrations") + "</p></a>",
                        "title": helpers.translateSync("Inbound integrations")
                    },
                    {
                        "description": helpers.translateSync("Identify the security risks and recommendations associated with machine identities to improve security."),
                        "icon": "sn_vsc.clipboard.svg",
                        "link": "<style type=\"text/css\">a:hover {background-color:RGB(var(--now-color--primary-1,30,133,109),var(--now-opacity--least,0.1));}</style><a style=\"width: 100%; height: 100%; display: inline-block; margin: 0px; padding: 0px; color: transparent;\" target=\"_blank\" href=\"/now/machine-identity-console/security-score\" rel=\"noopener\"><p>" + helpers.translateSync("Link to security findings") + "</p></a>",
                        "title": helpers.translateSync("Security findings")
                    }
                ]
            },
            {
                "sectionTitle": "",
                "title": helpers.translateSync("Other configuration tools"),
                "description": helpers.translateSync("Customize your security protections with tools designed to meet your organization's unique security configuration needs."),
                "link": "/now/security-center-configuration/overview",
                "target": "_self",
                "tools": [{
                        "description": helpers.translateSync("Improve your hardening score and see what activities are driving changes in your score."),
                        "icon": "sn_vsc.lightening.svg",
                        "link": "<style type=\"text/css\">a:hover {background-color:RGB(var(--now-color--primary-1,30,133,109),var(--now-opacity--least,0.1));}</style><a style=\"width: 100%; height: 100%; display: inline-block; margin: 0px; padding: 0px; color: transparent;\" href=\"/now/security-center-configuration/hardening_score_comparison\" rel=\"noopener\"><p>" + helpers.translateSync("Link to hardening score comparison") + "</p></a>",
                        "title": helpers.translateSync("Hardening score comparison")
                    },
                    {
                        "description": helpers.translateSync("Complete important, instance-specific configurations with time-sensitive target dates."),
                        "icon": "sn_vsc.calendar-clock.svg",
                        "link": "<style type=\"text/css\">a:hover {background-color:RGB(var(--now-color--primary-1,30,133,109),var(--now-opacity--least,0.1));}</style><a style=\"width: 100%; height: 100%; display: inline-block; margin: 0px; padding: 0px; color: transparent;\" href=\"/now/security-center-configuration/customer_actions\" rel=\"noopener\"><p>" + helpers.translateSync("Link to customer actions") + "</p></a>",
                        "title": helpers.translateSync("Customer actions")
                    },
                    {
                        "description": helpers.translateSync("Review findings for improved security from automated scans of your instance."),
                        "icon": "sn_vsc.clipboard.svg",
                        "link": "<style type=\"text/css\">a:hover {background-color:RGB(var(--now-color--primary-1,30,133,109),var(--now-opacity--least,0.1));}</style><a style=\"width: 100%; height: 100%; display: inline-block; margin: 0px; padding: 0px; color: transparent;\" href=\"/now/security-center-configuration/security_scan_findings\" rel=\"noopener\"><p>" + helpers.translateSync("Link to security scanner") + "</p></a>",
                        "title": helpers.translateSync("Security scanner")
                    }
                ]
            },

            {
                "sectionTitle": helpers.translateSync("Monitoring"),
                "description": helpers.translateSync("Monitor and detect potential security threats on your instance by settings up thresholds or security event notifications."),
                "link": "/now/security-center-monitoring/overview",
                "title": helpers.translateSync("Monitoring"),
                "target": "_self",
                "tools": [{
                        "description": helpers.translateSync("Review activities and thresholds that have been breached."),
                        "icon": "sn_vsc.headset.svg",
                        "link": "<style type=\"text/css\">a:hover {background-color:RGB(var(--now-color--primary-1,30,133,109),var(--now-opacity--least,0.1));}</style><a style=\"width: 100%; height: 100%; display: inline-block; margin: 0px; padding: 0px; color: transparent;\" href=\"/now/security-center-monitoring/security_policies\" rel=\"noopener\"><p>" + helpers.translateSync("Link to security event notifications") + "</p></a>",
                        "title": helpers.translateSync("Security event notifications")
                    },
                    {
                        "description": helpers.translateSync("Review key metrics that give you insight into your instance."),
                        "icon": "sn_vsc.contextual-sidebar-gear.svg",
                        "link": "<style type=\"text/css\">a:hover {background-color:RGB(var(--now-color--primary-1,30,133,109),var(--now-opacity--least,0.1));}</style><a style=\"width: 100%; height: 100%; display: inline-block; margin: 0px; padding: 0px; color: transparent;\" href=\"/now/security-center-monitoring/all_security_metrics\" rel=\"noopener\"><p>" + helpers.translateSync("Link to security metrics") + "</p></a>",
                        "title": helpers.translateSync("Security metrics")
                    }
                ]
            },

        ]
    };

    return consolesObj.consoles;

}
