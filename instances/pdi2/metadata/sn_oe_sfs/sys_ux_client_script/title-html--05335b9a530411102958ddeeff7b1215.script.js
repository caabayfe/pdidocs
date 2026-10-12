/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const {
        title,
        inline_style
    } = api.context.props.payload.props_details.plugin_title;
    return `
    <style>
    .plugin_card_title {
 font-size: 16px;
      font-weight: 600;
      text-align: center;
      margin-left:auto;
      margin-right:auto;
      min-width:2rem
    }
    p{
      margin-bottom:1px;
    }
    </style>
    <p class="plugin_card_title" ${inline_style ? `style=${inline_style}` : ''}>
      ${title}
    </p>
  `;

}
