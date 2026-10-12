/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var styles = `<style>
    th {
        gap: 2rem;
        padding: 0.6rem 0;
        font-size: 1rem;
        font-weight: 700;
        text-align:left;
        padding-left:5rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid rgb(153, 153, 153);
        border-top: 1px solid rgb(153, 153, 153);
    }
    td {
        padding-left: 5rem;
    }
    div {
        color: RGB(var(--now-color_text--primary,var(--now-color--neutral-18,22,27,28)));font-size: 1rem;
    }
    </style>`;
    var items = api.data.get_menu_items.results;
    var translations = api.data.translations.output;
    const TABLE_PREFIX = `
        <table role="grid" style="width:100%" cellpadding="0" cellspacing="0" border="0">
        <thead>
        <tr>
            <th tabindex="0"> ${translations.icon} </th>
            <th tabindex="0"> ${translations.label} </th>
            <th tabindex="0"> ${translations.type} </th>
            <th tabindex="0"> ${translations.value} </th>
        </tr>
        </thead>
        <tbody>`;
    const TABLE_SUFFIX = `</tbody></table>`;
    var htmlContent = [styles];
    htmlContent.push(TABLE_PREFIX);
    items.forEach((item, index) => {
        var txt = '';
        const image_src = item.icon.displayValue || "image";
        var alt = "";
        if(image_src == "image")
            alt = " ";
        const sys_id = item._row_data.uniqueValue;
        const color = index % 2 == 0 ? 'RGB(var(--now-color_background--secondary,var(--now-color--neutral-1,246,247,247)))' : 'white';
        const label = item.label.value || "";
        const type = item.type.value || "";
        const value = item.value.value || "";
        const rowTemplate = `
            <tr style="background:${color}; width: 100%;height: 100%;">  
                <td>  
                    <a aria-label="${image_src}" href="/now/conversation/v1settings/ci-record/va_branding_contact_menu/${sys_id}">
                        <img src="${image_src}" alt="${alt}" style="max-height:70px;max-width:70px;">
                    </a>  
                </td>
                <td tabindex="0">
                    <div aria-label="${label}">
                        <p>${label}</p>
                    </div>
                </td>
                <td tabindex="0">
                    <div aria-label="${type}">
                        <p>${type}</p>
                    </div>
                </td>
                <td tabindex="0">
                    <div aria-label="${value}">
                        <p>${value}</p>
                    </div>
                </td>
            </tr>
        `;
        htmlContent.push(rowTemplate);
    });
    htmlContent.push(TABLE_SUFFIX);
    return htmlContent.join('\n');
}
