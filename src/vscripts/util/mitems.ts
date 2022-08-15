import { log } from "./Utility";

export function GetNumItemsInInventory(unit: CDOTA_BaseNPC) {
    let count = 0
    for (let i = 0; i < 5; i++) {
        const item = unit.GetItemInSlot(i)
        if (item) count += 1;
    }
    return count
}

// Takes all items and puts them 1 slot back
export function ReorderItems(caster: CDOTA_BaseNPC){
    const slots: number[] = []
    for(let itemSlot = 0; itemSlot < 6; itemSlot++){
        let item: CDOTA_Item | undefined
        if(IsValidEntity(caster))
            item = caster.GetItemInSlot(itemSlot)

        if(item != undefined)
            slots.push(itemSlot)
    }
    for(let k = 0; k < slots.length; k++){
        const itemSlot = slots[k];
        caster.SwapItems(itemSlot, k - 1);
    }
    log("Items swapped. Total items: " + slots.length);
}

export function IsInFirstSlot(unit: CDOTA_BaseNPC, _item: CDOTA_Item){
    for(let itemSlot = 0; itemSlot < 5; itemSlot++){
        let item: CDOTA_Item | undefined
        unit.GetItemInSlot(itemSlot)
        if(unit){
            return _item == item
        }
    }
    return false
}