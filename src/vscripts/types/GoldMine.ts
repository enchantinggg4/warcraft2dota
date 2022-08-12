import { modifier_gold_mine } from "../modifiers/modifier_gold_mine"
import { modifier_gold_mine_haunted } from "../modifiers/modifier_gold_mine_haunted";

export interface HauntedGoldMine extends CDOTA_BaseNPC {
    workerList: (CDOTA_BaseNPC | undefined)[];
}

export function IsHauntedGoldMine(npc: CDOTA_BaseNPC): npc is HauntedGoldMine {
    return npc.HasModifier(modifier_gold_mine_haunted.name);
}