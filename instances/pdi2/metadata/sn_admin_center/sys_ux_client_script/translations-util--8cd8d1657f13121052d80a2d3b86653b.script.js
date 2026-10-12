/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {

    const helpfulResources = [{
        "label": await helpers.translate("ServiceNow Vault"),
        "left icon": "compass-outline",
        "link": "https://www.servicenow.com/products/vault.html",
        "right icon": "open-link-right-fill"
    }, {
        "label": await helpers.translate("ServiceNow Vault documentation"),
        "left icon": "document-outline",
        "link": "https://www.servicenow.com/docs/csh?topicname=vault-homepage.html&version=latest",
        "right icon": "open-link-right-fill"
    }, {
        "label": await helpers.translate("Platform Encryption"),
        "left icon": "compass-outline",
        "link": "https://www.servicenow.com/products/platform-encryption.html",
        "right icon": "open-link-right-fill"
    }, {
        "label": await helpers.translate("Data Privacy Datasheet"),
        "left icon": "document-outline",
        "link": "https://www.servicenow.com/content/dam/servicenow-assets/public/en-us/doc-type/resource-center/data-sheet/ds-servicenow-data-privacy.pdf",
        "right icon": "open-link-right-fill"
    }, {
        "label": await helpers.translate("Zero Trust Access"),
        "left icon": "compass-outline",
        "link": "https://www.servicenow.com/products/zero-trust.html",
        "right icon": "open-link-right-fill"
    }, {
        "label": await helpers.translate("Log Export Services Datasheet"),
        "left icon": "document-outline",
        "link": "https://www.servicenow.com/content/dam/servicenow-assets/public/en-us/doc-type/resource-center/data-sheet/ds-log-export-services.pdf",
        "right icon": "open-link-right-fill"
    }, {
        "label": await helpers.translate("Code signing documentation"),
        "left icon": "document-outline",
        "link": "https://www.servicenow.com/docs/csh?topicname=explore-code-signing.html&version=latest",
        "right icon": "open-link-right-fill"
    }];
    api.setState('helpfulResources', helpfulResources);

    const faqResources = [{
            "header": await helpers.translate("What is ServiceNow Vault?"),
            "content": await helpers.translate("ServiceNow Vault is a premium security offering that enhances the protection of sensitive data on ServiceNow instance and ensures compliance with regulatory standards. It includes advanced features and tools that help organizations safeguard their information, particularly in industries with strict security and privacy requirements.")
        },
        {
            "header": await helpers.translate("What is included in ServiceNow Vault?"),
            "content": await helpers.translate("It includes five products: Platform Encryption, Data Privacy, Zero Trust Access, Log Export Service and Code Signing")
        },
        {
            "header": await helpers.translate("What is Vault Console?"),
            "content": await helpers.translate("It provides integrated security & privacy controls to help admin quickly secure all the workflows and gain insights on sensitive data. It integrates know your data, protect your data tools to provide a cohesive experience for protecting sensitive data.")
        }
    ];
    api.setState('faqResources', faqResources);

    const knowYourDataCard = [{
        "button_label": await helpers.translate("Go to Data discovery"),
        "description": await helpers.translate("Run a discovery scan to look for data patterns that might be sensitive data.<br/> Once discovered, data can then be reviewed or classified for further protection and management."),
        "name": await helpers.translate("Data discovery")
    }, {
        "button_label": await helpers.translate("Go to Classification"),
        "description": await helpers.translate("Create data classes and organize your data into data classes for better data management. <br/> Once classified, data can be protected at the class level."),
        "name": await helpers.translate("Classification")
    }];
    api.setState('knowYourDataCard', knowYourDataCard);

    const protectYourDataCard = [{
        "button_label": await helpers.translate("Go to Anonymization"),
        "description": await helpers.translate("Anonymize data by data class with different anonymization techniques to preserve data patterns but remove sensitive data. <br/> Useful for sanitizing instances for development or removing specific user data because of rights to be forgotten."),
        "name": await helpers.translate("Anonymization")
    }, {
        "button_label": await helpers.translate("Go to Cloud encryption"),
        "description": await helpers.translate("Encrypt all data stored on the platform."),
        "name": await helpers.translate("Cloud encryption")
    }, {
        "button_label": await helpers.translate("Go to Field encryption"),
        "description": await helpers.translate("Securely protect sensitive data while providing access for authorized users. <br/>Useful for increasing protections from bad actors."),
        "name": await helpers.translate("Field encryption")
    }, {
        "button_label": await helpers.translate("Go to Zero trust access"),
        "description": await helpers.translate("Access reduction and continuous authentication while accessing classified sensitive data in real time."),
        "name": await helpers.translate("Zero trust access")
    }];
    api.setState('protectYourDataCard', protectYourDataCard);

    const manageYourDataCard = {
        "button_label": await helpers.translate("Go to Security center"),
        "description": await helpers.translate("Actively monitor threats to your instance data."),
        "name": await helpers.translate("Security center")
    };
    api.setState('manageYourDataCard', manageYourDataCard);
}
