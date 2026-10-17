function transform(input) {
    const groupAllocationService = new sn_sub_man.GroupAllocationService();
    return groupAllocationService.isUserAllocationDisplayEnabled();
}
