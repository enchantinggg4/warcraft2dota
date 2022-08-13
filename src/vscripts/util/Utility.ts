import { BaseModifier } from "../lib/dota_ts_adapter";
import { modifier_gold_deposit } from "../modifiers/building/modifer_gold_deposit";
import { modifier_generic_building } from "../modifiers/building/modifier_generic_building";
import { modifier_lumber_deposit } from "../modifiers/building/modifier_lumber_deposit";
import { HauntedGoldMine, Resource, ResourceHarvester } from "../types/GoldMine";

export class Utility {
    public static FindClosestDeposit(npc: ResourceHarvester, resource: Resource): CDOTA_BaseNPC | undefined {
        const res = FindUnitsInRadius(npc.GetTeam(), npc.GetAbsOrigin(), undefined, 10000, UnitTargetTeam.FRIENDLY, UnitTargetType.ALL, UnitTargetFlags.NONE, FindOrder.CLOSEST, false);

        const modifier = resource == Resource.GOLD ? modifier_gold_deposit : modifier_lumber_deposit
        for (let r of res) {
            if (r.HasModifier(modifier.name)) {
                return r;
            }
        }

        return undefined;
    }


    public static FindClosestFreeMine(position: Vector): CDOTA_BaseNPC | undefined {
        const targets: CDOTA_BaseNPC[] = FindUnitsInRadius(DotaTeam.NEUTRALS, position, undefined, 10000, UnitTargetTeam.FRIENDLY, UnitTargetType.BUILDING, UnitTargetFlags.NONE, FindOrder.CLOSEST, true);

        for (let target of targets) {
            print(target.GetUnitName())
            if (target.GetUnitName() == "npc_dota_building_neutral_gold_mine") {
                return target;
            }
        }
        return undefined;
    }


    public static FindClosestBuilding(position: Vector, team: DotaTeam, radius = 1000): CDOTA_BaseNPC | undefined {
        const targets: CDOTA_BaseNPC[] = FindUnitsInRadius(team, position, undefined, radius, UnitTargetTeam.FRIENDLY, UnitTargetType.ALL, UnitTargetFlags.NONE, FindOrder.CLOSEST, true);

        for (let target of targets) {
            if (target.HasModifier(modifier_generic_building.name)) {
                return target;
            }
        }
        return undefined;
    }


    public static IsMyOrder(modifier: BaseModifier, order: ModifierUnitEvent): boolean {
        return order.unit.entindex() == modifier.GetParent().entindex();
    }



    public static FindFreeSpot(mine: HauntedGoldMine) {
        for (let i = 0; i < 5; i++) {
            if (!mine.workerList[i]) return i;
        }

    }
}



export function DistanceTo(npc1: CBaseEntity, npc2: CBaseEntity): number {
    return npc1.GetAbsOrigin().__sub(npc2.GetAbsOrigin()).Length();
}


export function DistanceToVec(npc1: CBaseEntity, t: Vector): number {
    return npc1.GetAbsOrigin().__sub(t).Length();
}

export function SendErrorMessage(playerID: PlayerID, msg: string) {
    CustomGameEventManager.Send_ServerToPlayer<any>(PlayerResource.GetPlayer(playerID)!, "dotacraft_error_message", { message: msg })
}