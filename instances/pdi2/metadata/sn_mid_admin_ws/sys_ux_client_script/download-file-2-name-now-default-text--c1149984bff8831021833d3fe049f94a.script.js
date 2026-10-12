/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    switch (api.context.props.installMethod) {
        case 'docker':
            return 'linux64DockerRecipe.zip';
        case 'deb':
            return 'linux64DEBSignatures.zip';
        case 'rpm':
            return 'linux64RPMSignatures.zip';
        default:
            return '';
    }
}
