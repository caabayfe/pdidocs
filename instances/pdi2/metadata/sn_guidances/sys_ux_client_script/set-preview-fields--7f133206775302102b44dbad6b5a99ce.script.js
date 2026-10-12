/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        short_description,
        number,
        author,
        sys_updated_on,
    } = api.data.get_preview_fields.result;
    const cardHeading = {
        label: short_description.displayValue
    };

    api.setState('heading', ({
        currentValue
    }) => ({
        ...currentValue,
        ...cardHeading
    }));
    var fieldsToDisplay = [{
            "label": number.label,
            "name": "knowledge",
            "value": {
                "type": "text-link",
                "label": number.displayValue,
                "href": "javascript:void(0)",
                "underlined": "true",
                "opensWindow": "false",
                "configAria": {
                    "link": {
                        "aria-label": `Number ${number.displayValue}`
                    }
                },
                "append-to-payload": {
                    "table": "kb_knowledge",
                    "sys_id": api.context.props.customExpProps.actionInputs.knowledge
                }
            }
        },
        {
            "label": author.label,
            "name": "knowledge.author",
            "value": {
                "type": "text-link",
                "label": author.displayValue,
                "href": "javascript:void(0)",
                "underlined": "true",
                "opensWindow": "false",
                "configAria": {
                    "link": {
                        "aria-label": `Author ${author.displayValue}`
                    }
                },
                "append-to-payload": {
                    "table": "sys_user",
                    "sys_id": author.value
                }
            }
        },
        {
            "label": sys_updated_on.label,
            "name": "knowledge.sys_updated_on",
            "value": {
                "type": "string",
                "value": sys_updated_on.displayValue
            }
        }
    ];
    api.setState("fieldsToDisplay", fieldsToDisplay);
}
