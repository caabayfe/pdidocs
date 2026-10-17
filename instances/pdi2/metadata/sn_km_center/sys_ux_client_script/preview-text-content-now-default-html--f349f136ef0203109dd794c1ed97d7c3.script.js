/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if (!api.item || !api.item.value) return '';

  const fieldStyle = api.item.value.field_style;
  const previewText = api.item.value.preview_text;

	return `<div style="${fieldStyle}">${previewText}</div>`;
}
