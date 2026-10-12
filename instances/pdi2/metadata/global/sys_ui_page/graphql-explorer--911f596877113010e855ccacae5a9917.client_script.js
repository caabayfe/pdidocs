GraphQLExplorer.render({
    elementId: 'graphql-explorer',
    fetcherOptions: {
        url: '/api/now/graphql',
        headers: {
            'X-UserToken': window.g_ck
        }
    }
});

document.getElementsByClassName("graphiql-execute-button")[0].addEventListener('click', function() {
    GlideUXMetrics.track("GraphQL Explorer - Click Execute query");
});

var introspectionEvents = function() {
    // Options for the observer (which mutations to observe)
    var config = {
        attributes: false,
        childList: true,
        subtree: true
    };

    // Callback function to execute when mutations are observed
    var callback = function(mutationList, observer) {
        var elements = document.getElementsByClassName("graphiql-doc-explorer-type-name");
        Array.from(elements).forEach(function(div) {
            div.addEventListener('click', function() {
                GlideUXMetrics.track("GraphQL Explorer - Introspection", {
                    "type": div.innerText
                });
            });
        });
    };

    // Create an observer instance linked to the callback function
    var observer = new MutationObserver(callback);

    // Select the node that will be observed for mutations
    var targetNode = document.getElementsByClassName("graphiql-plugin")[0];

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);
};

introspectionEvents();
