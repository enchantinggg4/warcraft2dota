import { BaseModifier } from "../lib/dota_ts_adapter";
import { modifier_generic_building } from "../modifiers/building/modifier_generic_building";
import { HauntedGoldMine } from "../types/GoldMine";

export class Utility {


    public static FindClosestFreeMine(position: Vector): CDOTA_BaseNPC | undefined {
        const targets: CDOTA_BaseNPC[] = FindUnitsInRadius(DotaTeam.NEUTRALS, position, undefined, 10000, UnitTargetTeam.FRIENDLY, UnitTargetType.BUILDING, UnitTargetFlags.NONE, FindOrder.CLOSEST, true);

        for(let target of targets){
            print(target.GetUnitName())
            if(target.GetUnitName() == "npc_dota_building_neutral_gold_mine"){
                return target;
            }
        }
        return undefined;
    }


    public static FindClosestBuilding(position: Vector, team: DotaTeam, radius = 1000): CDOTA_BaseNPC | undefined {
        const targets: CDOTA_BaseNPC[] = FindUnitsInRadius(team, position, undefined, radius, UnitTargetTeam.FRIENDLY, UnitTargetType.ALL, UnitTargetFlags.NONE, FindOrder.CLOSEST, true);

        for(let target of targets){
            if(target.HasModifier(modifier_generic_building.name)){
                return target;
            }
        }
        return undefined;
    }


    public static IsMyOrder(modifier: BaseModifier, order: ModifierUnitEvent): boolean {
        return order.unit.entindex() == modifier.GetParent().entindex();
    }



    public static FindFreeSpot(mine: HauntedGoldMine){
        for(let i = 0; i < 5; i++){
            if(!mine.workerList[i]) return i;
        }
        
    }
}