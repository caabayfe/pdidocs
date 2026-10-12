/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let richTextContent = '';
    if (api.context.props.payload.summary) {
        richTextContent = `
<style>
  * {
    font-size: var(--now-global-font-size--sm, 12px);
    line-height: 14px;
    color: rgb(var(--now-color_text--tertiary, 69, 77, 91));
  }
  p {
    margin: 0;
  }
  .app-summary-container {
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    text-overflow: ellipsis;
  }
</style>
<div class="app-summary-container">
  <div>
    ${api.context.props.payload.summary}
  </div>
</div>
`;
    }

    return richTextContent;
}
