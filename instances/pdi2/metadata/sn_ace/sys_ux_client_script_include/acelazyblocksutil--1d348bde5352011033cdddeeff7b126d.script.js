function include({ imports }) {
    const getlazyBlocks = (blocks = [], lazyBlocks = []) => {
        blocks.forEach((cb) => {
            if (cb.lazyLoad === "1") lazyBlocks.push(cb);

            if (cb.children && cb.children.length > 0)
                getlazyBlocks(cb.children, lazyBlocks);
        });
        return lazyBlocks;
    };

    const getLazyBlockIds = (blocks = []) => {
        return getlazyBlocks(blocks).map((b) => b.block_id);
    };

    const patchLazyBlock = (blocks = [], lazyLoadedBlock) => {
        // TODO: revisit this logic
        for (let i = 0; i < blocks.length; i++) {
            const cb = blocks[i];
            if (cb.block_id === lazyLoadedBlock.block_id) {
                blocks[i] = { ...lazyLoadedBlock, children: cb.children };
                break;
            } else if (cb.children && cb.children.length > 0) {
                blocks[i].children = [...cb.children];
                patchLazyBlock(blocks[i].children, lazyLoadedBlock);
            }
        }
    };

    return {
        // Get lazy blocks payload
        getlazyBlocks: getlazyBlocks,
        getLazyBlockIds: getLazyBlockIds,
        patchLazyBlock: patchLazyBlock,
    };
}
