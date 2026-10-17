/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var redirectLink = '<style type="text/css">a:hover {background-color:RGB(var(--now-color--primary-1,30,133,109),var(--now-opacity--least,0.1));}</style><a style="width: 100%; height: 100%; display: inline-block; margin: 0px; padding: 0px; color: transparent;" href="/now/machine-identity-console/home" target="_blank" rel="noopener"><p>Link to Machine identity console</p></a>';
    return redirectLink;
}
