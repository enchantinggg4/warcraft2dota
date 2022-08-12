import { modifier_gold_mine } from "../modifiers/mine/modifier_gold_mine"
import { modifier_gold_mine_haunted } from "../modifiers/mine/modifier_gold_mine_haunted";

export interface HauntedGoldMine extends CDOTA_BaseNPC {
    workerList: (CDOTA_BaseNPC | undefined)[];
    goldMineEntityId: EntityIndex;
}

export interface GoldMine extends CDOTA_BaseNPC {
    gold: number;
}

export function IsHauntedGoldMine(npc: CDOTA_BaseNPC): npc is HauntedGoldMine {
    return npc.HasModifier(modifier_gold_mine_haunted.name);
}

export enum Resource {
    GOLD, LUMBER
}

export interface ResourceHarvester extends CDOTA_BaseNPC {
    payload?: { resource: Resource, amount: number };
}