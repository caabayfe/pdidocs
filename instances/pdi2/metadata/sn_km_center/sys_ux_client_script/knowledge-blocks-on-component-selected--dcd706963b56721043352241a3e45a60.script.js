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
    const payload = event.payload;
    let selectedInfo = {};

    switch (event.name) {
        case 'SN_ENHANCED_CONTENT_EDITOR#COMPONENT_SELECTED':
            if (payload.isBody) return;

            try {
                const parsedHTML = parseHTML(payload.content.html, payload.id);
                selectedInfo['selectedText'] = parsedHTML.target || parsedHTML.body;
                selectedInfo['selectedTextId'] = payload.id;
                selectedInfo['selectedSection'] = payload.section;
            } catch (e) {
                console.error('Knowledge Blocks Selection Error: ' + e);
            }
            break;
        case 'SN_ENHANCED_CONTENT_EDITOR#COMPONENT_DESELECTED':
            if (payload.id == api.state.selectedInfo.selectedTextId) {
                selectedInfo['selectedText'] = {};
                selectedInfo['selectedTextId'] = null;
                selectedInfo['selectedSection'] = null;
            }
            break;
    }

    api.setState('selectedInfo', selectedInfo)

    // TODO: This is copied from Open Prompt - On Context Changed, consolidate
    function parseHTML(s, targetId) {
        let html, text;
        let parsedTarget = null;
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(s, 'text/html');
            if (doc.body) {
                html = doc.body.innerHTML;
                text = doc.body.innerText;
            } else {
                html = doc.outerHTML;
                text = doc.outerText;
            }
            if (targetId) {
                const target = doc.querySelector(`#${targetId}`);
                if (target) {
                    parsedTarget = {
                        text: target.outerText,
                        html: target.outerHTML
                    };
                }
            }
        } catch (e) {
            console.error('Knowledge Blocks Selection Error: ' + e);
        }
        return {
            body: {
                html,
                text
            },
            target: parsedTarget
        };
    }
}
