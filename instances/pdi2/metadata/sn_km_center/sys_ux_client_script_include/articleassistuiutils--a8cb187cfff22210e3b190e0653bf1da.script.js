function include({
    imports
}, api, helpers) {

    const normalizeWhitespace = (str) => (typeof str === 'string' ? str : '').replace(/\s+/g, ' ').trim();
    const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    /**
     * Opens a modal if input is required for the result.
     * Checks if the selected scan has inputs defined. If so, stores the scan,
     * results, and modal tab configuration in state, then opens the input modal.
     * @param {object} selectedScan - The scan object containing input definitions
     * @param {array} selectedResults - The results associated with the selected scan
     * @returns {boolean} true if the modal was opened, false if no inputs were required
     */
    const openModal = (selectedScan, selectedResults, ) => {
        const {
            value: {
                inputs
            }
        } = selectedScan;
        if (inputs && inputs.length > 0) {
            api.setState("inputs", inputs);
            api.setState("selectedScan", selectedScan);
            api.setState("selectedResults", selectedResults);

            const modalTabs = selectedResults.map(({
                value
            }) => {
                return {
                    icon: null,
                    label: value.result.name,
                    fields: value.result
                };
            });
            api.setState('modalTabs', modalTabs);
            helpers.modal.open("[component-id$='input_modal']");
            return true;
        }

        return false;
    };

    /**
     * Replaces handlebars-style placeholders in a recommendation string with user-provided values.
     * Iterates over the inputs array and replaces each {{input.name}} token in the
     * recommendation string with the corresponding value from the values object.
     * @param {string} recommendedContent - The recommendation string containing placeholders
     * @param {array} inputs - Array of input definition objects, each with a `name` property
     * @param {object} values - Key/value map of input names to user-provided values
     * @returns {string} The recommendation string with all placeholders substituted
     */
    const handleInputs = (recommendedContent, inputs = [], values = {}) => {

        let recommendation = recommendedContent;
        if (inputs.length > 0) {
            inputs.forEach((input) => {
                recommendation = recommendation.replace("{{" + input.name + "}}", values[input.name]);
            });
        }
        return recommendation;
    };

    /**
     * Sends the updated field value to the appropriate form controller via event emission.
     * For article fields, collects the inner HTML from each ECE field in the articleDOM
     * array and emits SET_ECE_HTML_FIELDS. For all other fields, emits SET_FIELD_VALUE
     * with the new value directly.
     * @param {string} field - The field identifier; "article" triggers ECE HTML update
     * @param {string|array} newValue - The updated value; array of articleDOM entries for article fields
     */
    const updateArticle = (field, newValue) => {
        if (field === 'article') {
            const eceHTMLFields = [];
            newValue.forEach(value => {
                eceHTMLFields.push({
                    id: value.id,
                    label: value.label,
                    // extract innerHTML from the parsed document body or first child node
                    value: value.value?.body?.innerHTML
                });
            });

            api.emit('ARTICLE_OPTIMIZATION#SET_ECE_HTML_FIELDS', {
                eceHTMLFields
            });
        } else {
            api.emit('ARTICLE_ASSIST#SET_FIELD_VALUE', {
                fieldName: field,
                value: newValue,
                displayValue: newValue,
            });
        }
    };

    /**
     * Builds an array of parsed DOM documents from the current article field values.
     * If contentFields are configured on the article_optimization_controller, each field
     * is parsed individually. Otherwise falls back to the default "text" field.
     * Each entry contains the field id, label, and a DOMParser document object.
     * @returns {array} Array of { id, label, value: Document } objects
     */
    const createArticleDOM = () => {
        const contentFields = api.data.article_optimization_controller.contentFields;
        const articleDOM = [];
        if (contentFields.length) {
            contentFields.forEach(field => {
                const articleContent = api.data.form_controller.form.fields[field.id].value;
                articleDOM.push({
                    id: field.id,
                    label: field.label,
                    value: (new DOMParser).parseFromString(articleContent, "text/html")
                });
            });
        } else {
            const articleContent = api.data.form_controller.form.fields.text.value;
            articleDOM.push({
                id: "text",
                label: "",
                value: (new DOMParser).parseFromString(articleContent, "text/html")
            });
        }

        return articleDOM;
    };

    /**
     * Searches across all fields in the articleDOM array for a node matching
     * the given cssSelector and textContent. Iterates fields in order and returns
     * the first match found, or null if no match exists in any field.
     * @param {array} articleDOM - Array of { id, label, value: Document } objects
     * @param {string} cssSelector - CSS selector to query; empty string triggers text-only search
     * @param {string} textContent - The exact text content to match against
     * @returns {Element|null} The matching DOM node, or null if not found
     */
    const findResultNode = (articleDOM, cssSelector, textContent) => {
        let node = null;
        for (let i = 0; i < articleDOM.length; i++) {
            node = findResultNodeinField(articleDOM[i].value, cssSelector, textContent);
            if (node != null) {
                break;
            }
        }
        return node;
    };

    /**
     * Searches a single parsed field document for a node matching the cssSelector
     * and textContent. If cssSelector is empty, falls back to findResultWithTextContent
     * for a recursive text-based search. If textContent is not provided, returns the
     * first node matching the selector. Otherwise returns the first selector match
     * whose textContent exactly equals the provided string.
     * @param {Document} fieldDOM - A DOMParser document for a single article field
     * @param {string} cssSelector - CSS selector to query; empty string triggers text search
     * @param {string} textContent - The exact text content to match against
     * @returns {Element|null} The matching DOM node, or null if not found
     */
    const findResultNodeinField = (fieldDOM, cssSelector, textContent) => {
        // if no cssSelector provided, fall back to recursive text content search
        if (cssSelector === '') {
            return findResultWithTextContent(fieldDOM, textContent);
        }
        const nodeList = fieldDOM.querySelectorAll(cssSelector);
        if (!textContent && nodeList.length) {
            return nodeList[0];
        }
        if (nodeList.length) {
            let node = null;
            for (let i = 0; i < nodeList.length; i++) {
                if (nodeList[i].textContent === textContent) {
                    node = nodeList[i];
                    break;
                }
            }
            return node;
        }
        return null;
    };

    /**
     * Recursively searches the DOM tree for the most specific element whose
     * textContent contains the target string. Traverses depth-first across all
     * siblings, tracking the deepest ancestor that matched as a fallback.
     * If a leaf node has no text (e.g. empty <span>), returns the nearest
     * ancestor that did contain the text rather than null.
     * @param {Document} fieldDOM - A DOMParser document for a single article field
     * @param {string} textContent - The text string to search for
     * @returns {Element|null} The most specific matching element, or null if not found
     */
    const findResultWithTextContent = (fieldDOM, textContent) => {
        if (!textContent) return null;
        const doc = fieldDOM;

        const getDepth = (el) => {
            let depth = 0;
            let current = el;
            while (current.parentElement) {
                depth++;
                current = current.parentElement;
            }
            return depth;
        };

        const isDeeper = (a, b) => getDepth(a) > getDepth(b);

        /**
         * Recursively searches the DOM tree for the most specific element whose
         * textContent contains the target string. Traverses depth-first across all
         * siblings, tracking the nearest ancestor that matched as a fallback.
         * If no single child contains the full target string (e.g. text split across
         * multiple inline elements), returns the nearest ancestor that did contain it
         * rather than descending further into children that will never fully match.
         * @param {Element} element - The current element to search
         * @param {Element|null} lastMatch - The deepest ancestor seen so far that matched
         * @returns {Element|null} The most specific matching element, or null if not found
         */
        const searchChildren = (element, lastMatch = null) => {
            if (!element.textContent || typeof element.textContent !== 'string') {
                return null;
            }

            const currentMatch = normalizeWhitespace(element.textContent).includes(normalizeWhitespace(textContent)) ? element : lastMatch;

            if (element.children.length === 0) {
                return currentMatch;
            }

            let bestMatch = null;
            for (const child of element.children) {
                const result = searchChildren(child, currentMatch);
                if (result) {
                    // only replace bestMatch if result is deeper in the tree than current bestMatch
                    if (!bestMatch || isDeeper(result, bestMatch)) {
                        bestMatch = result;
                    }
                    // exact match — stop searching siblings
                    if (normalizeWhitespace(result.textContent) === normalizeWhitespace(textContent)) {
                        break;
                    }
                }
            }

            return bestMatch || currentMatch;
        };

        return searchChildren(doc.body);
    };

/**
 * Applies a single recommendation to the article DOM or a non-article field.
 * For article fields: locates the target node using cssSelector and textContent,
 * then replaces it with the parsed recommendation HTML. The replaced node preserves
 * the original tag of the matched node (e.g. h2, li, blockquote) rather than
 * always wrapping in a <p>. Void elements (e.g. img, hr, br) are replaced
 * directly without wrapping since they cannot have children or a closing tag.
 * Recommendations that are already fully formed HTML (i.e. start with a tag) are
 * also parsed directly without wrapping, to support scans that build their own
 * replacement element (e.g. h1→h2 conversion).
 * If the node's current text differs from the stored textContent (i.e. the user
 * has partially edited it or the target text is a substring of a larger block),
 * performs a substring find-and-replace using improvedText before replacing the node.
 * For non-article fields: returns the recommendation string directly after
 * substituting any input placeholders.
 * Returns null if the target node cannot be found in the article.
 * @param {object} result - The result object containing field, recommendation, cssSelector, textContent, improvedText
 * @param {array|null} articleDOM - Pre-built articleDOM array, or null to build fresh
 * @param {array} inputs - Array of input definition objects for placeholder substitution
 * @param {object} values - Key/value map of input names to user-provided values
 * @returns {array|string|null} Updated articleDOM for article fields, recommendation string for other fields, or null if node not found
 */
const updateContentValue = (result, articleDOM = null, inputs = [], values = {}) => {
    const field = result.field;
    let recommendedContent = result.improvedText || result.recommendation || '';
    recommendedContent = handleInputs(recommendedContent, inputs, values);

    if (field === 'article') {

        if (articleDOM === null) {
            articleDOM = createArticleDOM();
        }

        const node = findResultNode(articleDOM, result.cssSelector, result.textContent);

        if (node) {
            // preserve the matched node's tag so replacements respect the
            // original structure (h2, li, blockquote, etc.) rather than
            // always defaulting to <p>
            const nodeTag = node.tagName.toLowerCase();

            // void elements cannot have children or a closing tag —
            // use recommendation directly rather than wrapping in nodeTag
            const voidElements = ['img', 'br', 'hr', 'input', 'link', 'meta', 'area', 'base', 'col', 'embed', 'param', 'source', 'track', 'wbr'];

            if (voidElements.includes(nodeTag)) {
                // void element — parse recommendation directly, no wrapping
                const replacement = (new DOMParser).parseFromString(recommendedContent, "text/html");
                const replacementNode = replacement.body.firstChild;
                if (replacementNode) {
                    const parent = node.parentNode;
                    parent.replaceChild(replacementNode, node);
                }
            } else if (result.textContent && result.improvedText && normalizeWhitespace(node.textContent) !== normalizeWhitespace(result.textContent)) {
                // partial edit — uses textContent for the replace which strips inline
                // formatting (e.g. <strong>, <em>) from the replaced portion. This is
                // intentional — the surrounding unaffected text retains its formatting
                // since we only replace the matching substring within the full textContent.
                // String.replace() replaces only the first occurrence, which is correct
                // since each finding targets a single specific sentence.
               
                const matchPattern = new RegExp(escapeRegExp(normalizeWhitespace(result.textContent)).replace(/ /g, '\\s+'));
                const updatedText = node.textContent.replace(matchPattern, result.improvedText);
                const replacement = (new DOMParser).parseFromString(
                    `<${nodeTag}>${updatedText}</${nodeTag}>`,
                    "text/html"
                );
                const parent = node.parentNode;
                parent.replaceChild(replacement.body.firstChild, node);
            } else {
                // if recommendation is already fully formed HTML (starts with a tag),
                // parse directly without wrapping — handles scans that build a complete
                // replacement element themselves (e.g. h1→h2 conversion, bad link fix).
                // uses /^<[a-zA-Z]/ rather than startsWith('<') to avoid misclassifying
                // plain text that begins with a comparison operator (e.g. "< 10% of readers")
                const isPreformedHTML = /^<[a-zA-Z]/.test(recommendedContent.trimStart());
                if (isPreformedHTML) {
                    const replacement = (new DOMParser).parseFromString(recommendedContent, "text/html");
                    const replacementNode = replacement.body.firstChild;
                    if (replacementNode) {
                        const parent = node.parentNode;
                        parent.replaceChild(replacementNode, node);
                    }
                } else {
                    // plain text recommendation — wrap in the original node's tag
                    const replacement = (new DOMParser).parseFromString(
                        `<${nodeTag}>${recommendedContent}</${nodeTag}>`,
                        "text/html"
                    );
                    const parent = node.parentNode;
                    parent.replaceChild(replacement.body.firstChild, node);
                }
            }
        } else {
            // node no longer exists in the article — signal failure to caller
            return null;
        }

        return articleDOM;
    }

    return recommendedContent;
};

    /**
     * Merges the active results array with the modifiedResults array, ensuring no duplicates.
     * For scan cards that exist in both arrays, inner results from modifiedResults are appended
     * if they are not already present (matched by sysId). New scan cards from modifiedResults
     * that don't exist in results are appended in full.
     * This ensures previously hidden modified results are re-evaluated on the next pullOut pass.
     * @param {array} results - The current active results from api.state.results
     * @param {array} modifiedResults - Previously hidden results from api.state.modifiedResults
     * @returns {array} The merged results array
     */
    const resultsMerge = (results = [], modifiedResults = []) => {
        const allResults = [...results];
        modifiedResults.forEach(modifiedResult => {
            const index = allResults.findIndex(result => result.sysId === modifiedResult.sysId);
            if (index === -1) {
                // scan card doesn't exist in active results — add it in full
                allResults.push(modifiedResult);
            } else {
                // scan card exists — append any inner results not already present
                modifiedResult?.results.forEach(modifiedResult => {
                    const innerIndex = allResults[index].results.findIndex(result => result.sysId === modifiedResult.sysId);
                    if (innerIndex === -1) {
                        allResults[index].results.push(modifiedResult);
                    }
                });
            }
        });
        return allResults;
    };

    /**
     * Evaluates all results against the current article DOM and splits them into two buckets:
     * - Results whose target node is still findable in the article remain in api.state.results (visible)
     * - Results whose target node can no longer be found move to api.state.modifiedResults (hidden)
     * This handles the case where a user manually edits the article text, invalidating a finding.
     * Modified results are retained so they can be restored if the user undoes their changes.
     * Results in excludeTextContents are treated as intentionally applied and removed from both buckets.
     * @param {array} results - The current active results to evaluate
     * @param {boolean} showAlert - Whether to show the "no longer valid" alert if results changed
     * @param {array} excludeTextContents - textContent strings of results just successfully applied;
     *   these are excluded from evaluation and removed from the visible results list
     */
    const pullOutModifiedResults = (results = [], showAlert = true, excludeTextContents = []) => {
        const articleDOM = createArticleDOM();
        const modifiedResults = api.state.modifiedResults;

        // merge active and previously hidden results before re-evaluating
        const allResults = resultsMerge(results, modifiedResults);

        const newResults = [];
        const newModifiedResults = [];

        allResults.forEach(result => {
            // identify inner results whose node can no longer be found in the article
            const modifiedInnerResults = result.results.filter(innerResult => {
                const {
                    field,
                    cssSelector,
                    textContent
                } = (innerResult?.result) || {};

                // skip results that were just intentionally applied —
                // match by textContent if available, fall back to cssSelector for scans that don't set textContent
                if (excludeTextContents.includes(textContent) || excludeTextContents.includes(cssSelector)) {
                    return false;
                }

                // only article field results are tracked by DOM node presence
                if (field != "article") {
                    return false;
                }

                // result is "modified" if its node can no longer be found in the article
                return !findResultNode(articleDOM, cssSelector, textContent);
            });

            // remaining results: node still found AND not in the just-applied exclusion list
            const unModifiedInnerResults = result.results.filter(innerResult =>
                !modifiedInnerResults.includes(innerResult) &&
                !excludeTextContents.includes(innerResult?.result?.textContent) &&
                !excludeTextContents.includes(innerResult?.result?.cssSelector)
            );

            if (modifiedInnerResults.length > 0) {
                newModifiedResults.push({ ...result, results: modifiedInnerResults });
            }
            if (unModifiedInnerResults.length > 0) {
                newResults.push({ ...result, results: unModifiedInnerResults });
            }
        });

        // alert the user if any results were hidden due to article edits
        if (showAlert && (JSON.stringify(results) !== JSON.stringify(newResults))) {
            addAlert("invalid");
        }

        api.setState('results', newResults);
        api.setState('modifiedResults', newModifiedResults);
    };

    /**
     * Applies a single scan result recommendation to the article or field.
     * Calls updateContentValue to perform the DOM replacement, then emits the
     * updated content to the form controller. After a successful update,
     * calls pullOutModifiedResults to remove the applied result from the visible
     * list and re-evaluate any remaining results against the updated article.
     * @param {object} result - The result object to apply (flat shape with field, recommendation, textContent, etc.)
     * @param {array} inputs - Array of input definition objects for placeholder substitution
     * @param {object} values - Key/value map of input names to user-provided values
     * @returns {boolean} true if the replacement succeeded, false if the node was not found
     */
    const replaceContent = (result, inputs = [], values = {}) => {
        const newContent = updateContentValue(result, null, inputs, values);
        if (!newContent) {
            addAlert("invalid", result.name);
            return false;
        }

        updateArticle(result.field, newContent);

        // exclude the just-applied result by textContent so pullOut doesn't treat it as user-modified
        pullOutModifiedResults(
            api.state.results,
            false,
            result.textContent ? [result.textContent] : (result.cssSelector ? [result.cssSelector] : [])
        );

        return true;
    };

    /**
     * Applies all results in a batch to the article or field using a shared articleDOM.
     * Reuses the same articleDOM across all iterations so sequential replacements are
     * applied cumulatively to the same in-memory document before a single emit.
     * After all replacements, emits the final articleDOM and calls pullOutModifiedResults
     * to remove all successfully applied results from the visible list.
     * @param {array} results - Array of result objects to apply
     * @param {array} inputs - Array of input definition objects for placeholder substitution
     * @param {array} values - Array of value maps, one per result, for placeholder substitution
     * @returns {boolean} true if at least one replacement succeeded
     */
    const replaceAllContent = (results = [], inputs = [], values = []) => {
        let changedContent = "";
        let contentChanged = false;
        // build articleDOM once and reuse across all replacements
        const articleDOM = createArticleDOM();
        const appliedTextContents = [];

        for (var i = 0; i < results.length; i++) {
            let formattedValues = {};
            if (inputs.length) {
                inputs.forEach(input => {
                    formattedValues[input.name] = values[i].fields[input.name];
                });
            }

            let content = updateContentValue(results[i], articleDOM, inputs, formattedValues);

            if (content) {
                changedContent = content;
                contentChanged = true;
                // track successfully applied results for exclusion from pullOut
                appliedTextContents.push(results[i].textContent || results[i].cssSelector);
            } else {
                addAlert("invalid", results[i].name);
            }
        }

        // use the shared articleDOM as the final content for article fields
        if (results.length === 0) return contentChanged;

        if (results[0].field === "article") {
            changedContent = articleDOM;
        }
        updateArticle(results[0].field, changedContent);

        // exclude all successfully applied results so pullOut doesn't treat them as user-modified
        pullOutModifiedResults(api.state.results, false, appliedTextContents);

        return contentChanged;
    };

    /**
     * Removes one or more inner results from a scan card in api.state.results.
     * If specific results are provided, filters them out by positional index.
     * If the scan card becomes empty, or no specific results were provided,
     * the entire scan card is removed. If the user is in the expanded single-card
     * view (showMore), collapses back to the full list via toggleShowMore.
     * @param {object} selectedScan - The scan card to remove results from, must have an `index` property
     * @param {array} selectedResults - The specific inner results to remove; empty array removes the whole card
     */
    const removeResults = (selectedScan, selectedResults = []) => {
        let results = [...api.state.results];
        const showMore = api.state.showMore;

        let scanIndex = selectedScan.index;

        // filter out the specified inner results by their positional index
        if (selectedResults.length > 0) {
            let indexList = selectedResults.map(result => result.index);

            results[scanIndex].results = results[scanIndex].results.filter((item, idx) => {
                return !indexList.includes(idx);
            });
        }

        // remove the whole scan card if it is now empty or no specific results were targeted
        if (selectedResults.length === 0 || results[scanIndex].results.length === 0) {
            results = results.filter((item, idx) => {
                return scanIndex != idx;
            });

            // if in expanded single-card view, collapse back to the full list
            if (showMore) {
                toggleShowMore(showMore, results);
                return;
            }
        }

        api.setState("results", results);
    };

    /**
     * Removes a specific alert from the alerts list by matching on message text.
     * @param {string} message - The message string of the alert to remove
     */
    const clearAlert = (message) => {
        let alerts = [...api.state.alerts];
        alerts = alerts.filter(alert => {
            return (alert.message != message);
        });
        api.setState("alerts", alerts);
    };

    /**
     * Appends a new alert object to the alerts list in state.
     * Called after translation is complete with the final translated message string.
     * @param {string} type - The alert severity type (e.g. "info", "positive")
     * @param {string} message - The translated message string to display
     */
    const addTranslatedAlert = (type, message) => {
        const alerts = [...api.state.alerts];
        // don't add a duplicate alert if the same message is already showing
        const alreadyExists = alerts.some(alert => alert.message === message && alert.type === type);
        if (alreadyExists) {
            return;
        }
        alerts.push({
            type: type,
            message: message
        });
        api.setState("alerts", alerts);
    };

    /**
     * Translates and adds an alert to the alerts list based on the alert type.
     * "ignore" → "{0} ignored." (info)
     * "update" → "{0} updated." (positive)
     * default with message → "{0} is no longer valid." (info)
     * default without message → "One or more findings are no longer valid." (info)
     * @param {string} type - The alert category: "ignore", "update", or any other value for invalid alerts
     * @param {string} message - Optional result name to interpolate into the translated string
     */
    const addAlert = (type, message) => {
        if (type === "ignore") {
            helpers.translate("{0} ignored.", message).then((translatedText) => {
                addTranslatedAlert("info", translatedText);
            });
        } else if (type === "update") {
            helpers.translate("{0} updated.", message).then((translatedText) => {
                addTranslatedAlert("positive", translatedText);
            });
        } else {
            if (message) {
                helpers.translate("{0} is no longer valid.", message).then((translatedText) => {
                    addTranslatedAlert("info", translatedText);
                });
            } else {
                helpers.translate("One or more findings are no longer valid.", message).then((translatedText) => {
                    addTranslatedAlert("info", translatedText);
                });
            }
        }
    };

    /**
     * Builds a unique CSS selector path from a given element up to the nearest
     * ancestor with an id, or up to the GrapeJS wrapper root if no id is found.
     * Uses nth-child positioning for elements without ids to ensure the path
     * uniquely identifies the element within the document.
     * If a sectionId is provided (multi-field ECE templates), the path is anchored
     * to the matching section[data-section-id] element instead of the wrapper root.
     * @param {Element} element - The DOM element to build a selector path for
     * @param {string} sectionId - Optional ECE section id for template-based articles
     * @returns {string} A CSS selector string that uniquely identifies the element
     */
    const getUniquePath = (element, sectionId = '') => {
        // if the element itself has an id, use it directly as the selector root
        if (element.id) {
            if (element.id.indexOf(' ') >= 0) {
                return `${element.tagName.toLowerCase()}[id="${element.id}"]`;
            }
            return `#${element.id}`;
        }

        const path = [];
        let current = element;

        while (current && current.nodeType === 1) {
            let selector = current.tagName.toLowerCase();

            if (current.id) {
                // ancestor has an id — use it as the root and stop traversing
                if (current.id.indexOf(' ') >= 0) {
                    selector = `${selector}[id="${current.id}"]`;
                } else {
                    selector = `#${current.id}`;
                }
                path.unshift(selector);
                break;
            }

            if (selector === 'body') {
                // reached the body — anchor to the GrapeJS wrapper or section root
                if (sectionId !== '') {
                    // template-based article: anchor to the specific section
                    selector = `div[data-gjs-type="section-content"]`;
                    path.unshift(selector);
                    selector = `section[data-section-id="${sectionId}"]`;
                    path.unshift(selector);
                } else {
                    // standard article: anchor to the GrapeJS wrapper div
                    selector = `div`;
                    path.unshift(selector);
                    selector = `div[data-gjs-type="wrapper"]`;
                    path.unshift(selector);
                }
                break;
            }

            // use nth-child to disambiguate elements without ids among their siblings
            if (current.parentElement) {
                const siblings = Array.from(current.parentElement.children);
                const index = siblings.indexOf(current) + 1;
                selector += `:nth-child(${index})`;
            }

            path.unshift(selector);
            current = current.parentElement;
        }

        return path.join(' > ');
    };

    /**
     * Finds the DOM node for a result and emits its unique CSS selector path
     * so the article editor can highlight the corresponding content.
     * For empty cssSelectors, uses findResultWithTextContent to locate the node.
     * Calls getUniquePath to build a stable selector for the found node,
     * incorporating the field's section id for multi-field template articles.
     * @param {object} result - The result object containing field, cssSelector, and textContent
     */
    const selectContent = (result) => {
        if (result.field === "article") {
            const articleDOM = createArticleDOM();

            const {
                cssSelector,
                textContent
            } = result;

            let selector = cssSelector;
            for (let i = 0; i < articleDOM.length; i++) {
                let nodeList = [];
                
                // for results with no cssSelector, find the node by text content directly
                if (cssSelector === "") {
                    const found = findResultWithTextContent(articleDOM[i].value, textContent);
                    nodeList = found ? [found] : [];
                } else {
                    nodeList = articleDOM[i].value.querySelectorAll(cssSelector);
                }
                if (nodeList.length === 0) {
                    continue;
                }
                if (textContent) {
                    for (let j = 0; j < nodeList.length; j++) {
                        // use includes rather than strict equality to handle partially edited nodes
                        if (normalizeWhitespace(nodeList[j].textContent).includes(normalizeWhitespace(textContent))) {
                            // build a unique path, passing sectionId for multi-field template articles
                            selector = getUniquePath(nodeList[j], (articleDOM.length > 1 ? articleDOM[i].id : ''));
                            break;
                        }
                    }
                }
                // selector resolved — exit the field loop
                break;
            }

            // reset to null first so the reactive consumer fires even if the same selector is re-selected
            api.emit("ARTICLE_OPTIMIZATION#SET_CSS_SELECTOR", {
                cssSelector: null
            });

            helpers.timing.setTimeout(function() {
                api.emit("ARTICLE_OPTIMIZATION#SET_CSS_SELECTOR", {
                    cssSelector: selector
                });
            }, 0);

        }
    };

    /**
     * Toggles between the expanded single-card view and the full results list.
     * When showMore is true (currently expanded), sets all cards to visible and collapses.
     * When showMore is false (currently collapsed), hides all cards except the selected one.
     * @param {boolean} showMore - The current expanded/collapsed state
     * @param {array} results - The full results array to update visibility on
     * @param {object} selectedScan - The scan card to show in single-card view; must have an `index` property
     */
    const toggleShowMore = (showMore, results, selectedScan) => {

        if (showMore) {
            // currently expanded — restore all cards to visible and collapse
            api.setState("results", results.map(result => {
                return {
                    ...result,
                    visible: true
                };
            }));
        } else {
            // currently collapsed — show only the selected card
            api.setState("results", results.map((result, idx) => {
                return {
                    ...result,
                    visible: idx === selectedScan.index
                };
            }));
            api.setState("selectedScan", selectedScan);
        }

        api.setState("showMore", !showMore);
    };

    return {
        openModal,
        replaceContent,
        replaceAllContent,
        removeResults,
        handleInputs,
        pullOutModifiedResults,
        addAlert,
        clearAlert,
        selectContent,
        toggleShowMore
    };
}
