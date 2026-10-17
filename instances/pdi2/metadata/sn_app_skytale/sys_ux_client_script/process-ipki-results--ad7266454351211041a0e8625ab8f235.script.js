/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    var output = api.data && api.data.status && api.data.status.output || null;
    var snKmfUi = output && output.data && output.data.snKmfUi || null;
    if (!snKmfUi) {
        console.error("Empty response received from the server.");
    }

    let issuingCertHealth = snKmfUi.status.health.children.INSTANCE_PKI.children.ISSUING_CERTIFICATE.health;
    let crlEndHealth = snKmfUi.status.health.children.INSTANCE_PKI.children.CRL_ENDPOINT.health;
    let kmfPluginHealth = snKmfUi.status.health.health;

    function _healthToLabel(color) {
        switch (color) {
            case "GRAY":
                return "Disabled";
            case "RED":
                return "Malfunction";
            case "YELLOW":
                return "Degraded";
            case "GREEN":
                return "Operational";
            default:
                return "Unknown";
        }
    }
    let certLabel = _healthToLabel(issuingCertHealth);
    let crlEndLabel = _healthToLabel(crlEndHealth);
    var ipkiHealth = {
        issuingCertificate: {
            health: issuingCertHealth,
            label: certLabel
        },
        crlEndpoint: {
            health: crlEndHealth,
            label: crlEndLabel
        }
    };
    api.setState("ipkiHealth", ipkiHealth);

    let isGeneratorOperational = (issuingCertHealth === "GREEN" && crlEndHealth === "GREEN");
    let isGeneratorOperationalReduced = (issuingCertHealth === "GREEN" && crlEndHealth === "YELLOW");
    let isKmfInstalled = (kmfPluginHealth === "GREEN");

    function getAlertState() {
        var alertType = "info";
        var alertMessage = "Checking KMF configuration";
        var alertHeader = "";
        if (isGeneratorOperationalReduced && isKmfInstalled) {
            alertType = "warning";
            alertHeader = snKmfUi.status.health.children.INSTANCE_PKI.children.CRL_ENDPOINT.warning;
            alertMessage = "Certificate generation may fail.";
        } else if (isGeneratorOperational && isKmfInstalled) {
            alertType = "positive";
            alertMessage = "";
            alertHeader = "All necessary KMF services operational.";
        } else {
            alertType = "critical";
            alertHeader = "A problem occurred with one or more KMF services.";
            alertMessage = "Check for Instance PKI issues in Key Management > Diagnostics, and then contact Customer Support for help.";
        }

        return {
            type: alertType,
            header: alertHeader,
            message: alertMessage
        };
    }

    function getEmptyState() {
        var icon = "no-data";
        var message = "Enter a password to use for your Instance PKI certificate.";
        if (!isKmfInstalled) {
            icon = "error";
            message = "You must activate the Key Management Framework plugin (com.glide.kmf.global) before you can generate an Instance PKI certificate.";
        } else if (!isGeneratorOperational) {
            icon = "error";
            message = "One or more KMF components are not operational. Check the component status above and then contact Customer Support for help.";
        }
        return {
            isHidden: false,
            icon: icon,
            message: message
        };
    }

    api.setState("emptyState", getEmptyState());
    api.setState("generatorOperational", isGeneratorOperational);

    api.setState("ipkiHealthAlert", getAlertState());
}
