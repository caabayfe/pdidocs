/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const item = api.context.props.item;
  const className = item.isActive ? 'active': '';
  const link = item.props_details.external_link === 'true' ?
    `<a href='${item.path}' target='_blank'>
      ${item.title}
      <now-icon icon='open-link-outline' style='margin-bottom: 3px' />
    </a>`
    : `<a href='${item.path}' class='${className}'>
      ${item.title}
    </a>`;

  return `
    <div style='display: flex; flex-direction: row'>      
      <style>
        a { color: white;
          font-size: 1rem;
          opacity: 0.8;
          text-decoration: none;
          padding: 0.75rem 1rem;
          line-height: 20px;
        }
        a.active { opacity : 1; border-bottom: 2px solid white; }
        a:hover { border-bottom: 2px solid white; opacity: 0.95;}
      </style>` + link + `</div>`;
}
