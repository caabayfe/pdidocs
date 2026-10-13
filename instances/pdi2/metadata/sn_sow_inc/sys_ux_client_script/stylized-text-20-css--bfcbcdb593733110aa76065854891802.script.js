/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.item.value.isHidden) {
        return `*{
        color: #0000004D;
        background-color: #D4EED8;
        padding: 4px 8px 4px 8px;
        border-radius: 4px;
        border: 1px solid #D4EED8;
        gap: 8px;
        word-wrap: break-word;
      }`;
    } else {
        return `*{
        color: #000000;
        background-color: #D4EED8;
        padding: 4px 8px 4px 8px;
        border-radius: 4px;
        border: 1px solid #D4EED8;
        gap: 8px;
        word-wrap: break-word;
      }`;
  }
}
