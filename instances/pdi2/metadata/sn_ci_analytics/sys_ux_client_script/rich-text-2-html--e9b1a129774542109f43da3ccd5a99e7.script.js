/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.imports
 */
function evaluateProperty({
    api,
    helpers
}) {
    const brandingSettings = api.context.props.brandingSettings || {};
    return `
    <div style="display: flex; align-items: center; height:100%; width:100%; background: ${brandingSettings.header_bg_color||''}">
        <img src="${brandingSettings.va_logo || ''}" style="border-radius: 50%; margin-left:15px; width: 42px; height: 42px; margin-right: 8px;" />
        <span style="color: ${brandingSettings.header_font_color || ''}; font-size: 18px; white-space: nowrap;">${brandingSettings.header_label||''}</span>
    </div>
  `;
}
