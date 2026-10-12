function handler({api}) {
            var flag = (api.state.isBlocksInfoShown != null) ? api.state.isBlocksInfoShown : false;
            if(flag) {
                api.setState('showHideBlocksButtonAriaLabel', {"aria-label": "Show Blocks"});
                api.setState('blocksButtonLabel', 'Show Blocks');
            }
            else {
                api.setState('showHideBlocksButtonAriaLabel', {"aria-label": "Hide Blocks"});
                api.setState('blocksButtonLabel', 'Hide Blocks');
            }
            api.setState('isBlocksInfoShown', !flag);
        }
