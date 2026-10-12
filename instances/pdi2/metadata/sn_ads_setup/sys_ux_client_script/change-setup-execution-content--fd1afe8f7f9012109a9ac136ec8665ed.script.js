/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return `<div>
  <p>${helpers.translateSync("Changing the setup type will have an impact on the number of times this setup can be run.")}</p>

<p>${helpers.translateSync("Single setup type can be run only once whereas Multi can be run as many times as needed.")}</p>

<p>${helpers.translateSync("Are you sure want to proceed with this change?")}</p> </div>`;
}
