/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
 function evaluateProperty({
  api,
  helpers
}) {
  return `
<style>
  * {
font-size: var(--now-global-font-size--md, 16px);
line-height: 19px;
    color: rgb(var(--now-color_text--primary, 21, 25, 32));
    font-family: var(--now-font-family, 'Lato');
  }
  p {
    margin: 0;
  }
</style>
<div tabindex="0">
  <span aria-label="${api.context.props.summary}">${api.context.props.summary}</span>
</div>
`;
}
