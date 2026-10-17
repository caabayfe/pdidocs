(function transform(transformBuilder, transformScriptArgs) {
    try {
        if (!transformBuilder) return;

        /**
         * Sets the display type for a person column: either avatar, name, or both. This function is not applicable to columns that are not the person type.
         * 
         * @param {Object[]} newDisplays An array representing the columns to update and their new display setting.
         * @param {string} newDisplays[].columnKey The key of a column to update.
         * @param {'avatar'|'name'|'both'} newDisplays[].newDisplay Sets the appearance of body cells in this column. Can be 'avatar', 'name', or 'both'.
         */
        const setAssignedToImageSrc = ({ cells }) => {
            const { assigned_to } = cells || {};
            if (assigned_to?.metadata?.referenceSysId) {
                const { metadata: { referenceSysId } } = assigned_to;
                const imageSrc = GlideAvatarFinder.getAvatarPath(referenceSysId);
                cells.assigned_to.imageSrc = imageSrc;
            }
        };
        transformBuilder.rowDefinitions.rows.forEach(row => {
            row.children?.forEach(child => setAssignedToImageSrc(child)); // when the list is grouped by a column
            row.cells && setAssignedToImageSrc(row);
        });
        var assignedToDisplays = [{
            columnKey: 'assigned_to',
            newDisplay: 'both'
        }];
        transformBuilder.changeDisplayForPersonColumn(assignedToDisplays);

        // do not remove
        var listModel = transformBuilder.transform();
        return listModel;
    } catch (error) {
        return {
            failed: true,
            error: error.message
        };
    }
})(transformBuilder, transformScriptArgs);
