import { modifier_gold_deposit } from "../modifiers/building/modifer_gold_deposit";
import { modifier_lumber_deposit } from "../modifiers/building/modifier_lumber_deposit";
import { modifier_acolyte } from "../modifiers/worker/modifier_acolyte";
import { modifier_harvest_tree } from "../modifiers/worker/modifier_harvest_tree";
import { Abilities } from "./Abilities";
import { Units } from "./Units";

export class Spawns {

    public static SpawnNecropolis(npc: CDOTA_BaseNPC){
        if(npc.GetUnitName() != Units.NECROPOLIS) return;
        npc.AddNewModifier(npc, undefined, modifier_lumber_deposit.name, { duration: - 1});
        npc.AddNewModifier(npc, undefined, modifier_gold_deposit.name, { duration: - 1});
    }

    public static SpawnAcolyte(npc: CDOTA_BaseNPC){
        if(npc.GetUnitName() != Units.ACOLYTE) return;
        npc.AddNewModifier(npc, undefined, modifier_acolyte.name, { duration: - 1});
    }

    public static SpawnGhoul(npc: CDOTA_BaseNPC){
        if(npc.GetUnitName() != Units.GHOUL) return;
        npc.AddNewModifier(npc, undefined, modifier_harvest_tree.name, { duration: - 1});
        

        npc.AddAbility(Abilities.WorkerHarvestLumber);
        npc.FindAbilityByName(Abilities.WorkerHarvestLumber)?.SetLevel(1);
        
        npc.AddAbility(Abilities.WorkerDepositPayload);
        npc.FindAbilityByName(Abilities.WorkerDepositPayload)?.SetLevel(1);
    }


    public static DoSpawns(npc: CDOTA_BaseNPC){
        Spawns.SpawnAcolyte(npc);
        Spawns.SpawnGhoul(npc);
        Spawns.SpawnNecropolis(npc);
    }
}