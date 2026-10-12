/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const link = api.context.props.payload.entitlementLink || '';
    const {
        translations
    } = api.state;

    return `<ul>
  <li>${translations["Validate app"]} ${link ?`<a href=${link} target="_blank">link</a>` : ``}</li>
  <li>${translations["Test in lower envs"]}</li>
  <li>${translations["Install with demo data"]}</li>
  </ul>`;

}
