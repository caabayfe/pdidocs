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
        plugin_title
    } = api.context.props.payload.props_details;
    if (!plugin_title)
        return `
    <style>
    .plugin_card_title {
      font-size: 19px;
      font-weight: 600;
      text-align: center;
      margin-bottom: 0.5rem;
      margin-left:auto;
      margin-right:auto; 
    }
    </style>`;

    const {
        title,
        inline_style
    } = plugin_title;
    return `
    <style>
    .plugin_card_title {
      font-size: 19px;
      font-weight: 600;
      text-align: center;
      margin-bottom: 0.5rem;
      margin-left:auto;
      margin-right:auto; 
    }
    </style>
    <p class="plugin_card_title" ${inline_style ? `style=${inline_style}` : ''}>
      ${title}
    </p>
  `;

}
