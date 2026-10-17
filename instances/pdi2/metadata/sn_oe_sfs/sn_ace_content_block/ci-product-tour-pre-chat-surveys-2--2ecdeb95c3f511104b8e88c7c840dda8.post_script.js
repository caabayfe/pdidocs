var composition = '<style>now-text-link{ font-size: 1rem; }</style>';
composition += '<p>' + gs.getMessage('Products') + '</p>';

composition += '<now-text-link label="' + gs.getMessage('Virtual Agent Designer') + '" href="/now/nav/ui/classic/params/target/$conversation-builder.do" opens-window="true" ></now-text-link></br>';


composition += '</br></br><p>' + gs.getMessage('Documentation') + '</p>';

composition += '<now-text-link label="' + gs.getMessage('Pre-Chat Survey') + '" href="/api/now/v1/context_doc_url/pcs-1003856" opens-window="true"></now-text-link></br>';

composition += '<now-text-link label="' + gs.getMessage('Context Variables') + '" href="/api/now/v1/context_doc_url/ci-define-topic-context-intent-config" opens-window="true"></now-text-link></br>';

composition += '<now-text-link label="' + gs.getMessage('Survey Creation') + '" href="/api/now/v1/context_doc_url/ci-create-chat-surveys" opens-window="true"></now-text-link></br>';


context.props_details.composition = composition;
