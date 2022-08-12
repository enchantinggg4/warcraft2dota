import { modifier_acolyte } from "../modifiers/worker/modifier_acolyte";
import { Units } from "./Units";

export class Spawns {


    public static SpawnAcolyte(npc: CDOTA_BaseNPC){
        if(npc.GetUnitName() != Units.ACOLYTE) return;
        npc.AddNewModifier(npc, undefined, modifier_acolyte.name, { duration: - 1});
    }
}