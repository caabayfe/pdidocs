/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const noteLabel = helpers.translateSync('Note');
  const message = helpers.translateSync('Recipients that are not admins will get read-only access to all adoption blueprints.');
	return `
  <style>
  span {
    font-family: 'Lato';
    font-size: var(--now-global-font-size--sm, 12px);
    line-height: 14px;
    letter-spacing: 0em;
    text-align: left;
    color: rgb(var(--now-color_text--secondary, 44, 50, 63));
  }
  </style>
  <span><b>${noteLabel}: </b>${message}</span>
  `;
}
