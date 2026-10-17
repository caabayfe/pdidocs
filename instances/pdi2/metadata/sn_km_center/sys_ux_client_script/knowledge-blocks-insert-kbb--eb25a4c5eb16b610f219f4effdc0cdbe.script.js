function handler({
    api,
    event,
    imports
}) {
    const isError = event.payload.errors.length !== 0;
    if (isError) {
        return;
    }

    const block = JSON.parse(event.payload.data.AppKnowledgeBlocks_Query.getKnowledgeBlocksSnippet)[0];
    if (!block) {
        return;
    }

    // Parse block content and add knowledge block class
    const blockContent = removeTrailingBr(block.blockdetails.trim());
    const eceBlockContent = addReadOnlyClass(blockContent);

    // Get the selected text id of the article body
    const selectedTextId = api.state.selectedInfo ? api.state.selectedInfo.selectedTextId : null;

    if (selectedTextId) {
        if (selectedTextId.includes('kbblock')) {
            return;
        }

        const payload = [{
            id: selectedTextId,
            content: eceBlockContent,
            replace: false,
            generated: false,
            loading: false
        }];
        api.setState('eceUpdateContentParams', payload);
    } else {
        // If KB article, add block directly to the text.
        // Blocks should not be added to templates without first selecting a section of the template.
        if (api.data.record.table === 'kb_knowledge') {
            const eceContent = [];
            let content = eceBlockContent;

            const text = api.data.record.form.fields.text.value;
            if (text) {
                content += text;
            }

            eceContent.push({
                id: api.state.eceHTMLFields.id,
                label: api.state.eceHTMLFields.label,
                value: content
            })

            api.setState('eceHTMLFields', eceContent);
            return;
        }
    }

    return;

    function removeTrailingBr(str) {
        return str.replace(/<br\s*\/?>\s*$/, '');
    }

    function addReadOnlyClass(blockContent) {
        let doc;
        try {
            const parser = new DOMParser();
            doc = parser.parseFromString(blockContent, 'text/html');
        } catch (e) {
            console.error('Knowledge Blocks Error: Unable to parse html');
            return;
        }
        const div = doc.body.firstElementChild;

        if (div && div.classList) {
            div.classList.add("ece-read-only-block");
        }
        return doc.body.innerHTML;
    }
}
