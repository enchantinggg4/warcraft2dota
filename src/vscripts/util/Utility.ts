import { RaceType } from "../data/races";
import { BaseModifier } from "../lib/dota_ts_adapter";
import { modifier_gold_deposit } from "../modifiers/building/modifer_gold_deposit";
import { modifier_generic_building } from "../modifiers/building/modifier_generic_building";
import { modifier_lumber_deposit } from "../modifiers/building/modifier_lumber_deposit";
import { HauntedGoldMine, Resource, ResourceHarvester } from "../types/GoldMine";


const DEBUG = true


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

export function tobool(s: any) {
    return s == "true" || s == "1" || s == 1
}

export function IsValidAlive(unit: CDOTA_BaseNPC | undefined) {
    return IsValidEntity(unit) && unit.IsAlive()
}



// Todo: make pathing aware
export function FindEmptyNavigableTreeNearby(unit: CDOTA_BaseNPC, anchor: Vector, distance: number) {
    const trees = GridNav.GetAllTreesAroundPoint(anchor, distance, false);
    // todo: we cant hit 1 tree with more than 1 worker
    return trees.sort((a, b) => DistanceToVec(a, anchor) - DistanceToVec(b, anchor))[0];
}

export function GetUnitGroupWithin(startingUnit: CDOTA_BaseNPC, radius: number) {
    const group: Record<EntityIndex, CDOTA_BaseNPC> = {};
    RecursiveFind(startingUnit, radius, group)

    return group
}

function RecursiveFind(unit: CDOTA_BaseNPC, radius: number, group: Record<EntityIndex, CDOTA_BaseNPC>) {
    const units = FindUnitsInRadius(unit.GetTeamNumber(), unit.GetAbsOrigin(), unit, radius, UnitTargetTeam.FRIENDLY, UnitTargetType.HERO + UnitTargetType.BASIC, UnitTargetFlags.NOT_MAGIC_IMMUNE_ALLIES, FindOrder.CLOSEST, true)

    if (units) {
        // Add to group
        for (let v of units) {
            const index = v.GetEntityIndex()
            if (!group[index]) {
                group[index] = v;
                RecursiveFind(v, radius, group)
            }
        }
    }
    return group;
}

const UNIT_FORMATION_DISTANCE = 150
const UNIT_FORMATION_DISTANCE_LARGE = 400

// Pick which units we want to move
export function RepositionAroundRallyPoint(unit: CDOTA_BaseNPC, building: CDOTA_BaseNPC, point: Vector) {
    const playerID = unit.GetPlayerOwnerID()
    const origin = building.GetAbsOrigin()
    const radius = UNIT_FORMATION_DISTANCE * 1.2
    const units: EntityIndex[] = []

    const moveCapability = unit.GetKeyValue("MovementCapabilities")
    const allies = FindAlliesInRadius(unit, radius, point)
    if (allies[0]) {
        const grouped_allies = GetUnitGroupWithin(allies[0], radius);
        Object.values(grouped_allies).forEach(v => {
            if (v.GetPlayerOwnerID() == playerID && v.IsIdle() && !IsCustomBuilding(v) && v.GetKeyValue("MovementCapabilities") == moveCapability) {
                units.push(v.GetEntityIndex())
            }
        })
    }
    units.push(unit.GetEntityIndex())

    const count = units.length;

    if (count > 0) {
        if (count == 1)
            unit.MoveToPosition(point)
        else {
            // todo
            // MoveUnitsInGrid(units, point, UnitOrder.MOVE_TO_POSITION, false, point.__sub(origin).Normalized())
        }

    }
}

function GetUnitsWithFormationRank(units_table: EntityIndex[], rank: number): EntityIndex[] | undefined {
    const allUnitsOfRank: EntityIndex[] = [];
    for (const unit_index of units_table) {
        if ((EntIndexToHScript(unit_index) as CDOTA_BaseNPC).GetFormationRank() === rank) {
            allUnitsOfRank.push(unit_index)
        }
    }
    if (allUnitsOfRank.length === 0) {
        return undefined;
    }
    return allUnitsOfRank;
}

function GetRowsAndColumns(numUnits: number, total: number): [number, number] {
    let squareFactor = 1;
    if (numUnits === 4 && total > 4) {
        return [1, 4];
    }
    else if (numUnits === 4 && total > 4) {
        return [1, 4];
    }
    else if (numUnits === 4 && total > 4) {
        return [1, 4];
    }
    else if (numUnits === 4 && total > 4) {
        return [1, 4];
    }
    else {
        if (numUnits > 12) {
            squareFactor = 1.3;
        }
        let rows = math.floor(math.sqrt(numUnits / squareFactor));
        let columns = math.floor(numUnits / rows);
        return [rows, columns];
    }
}

function GetClosestUnitToPoint(units_table: EntityIndex[], point: Vector): EntityIndex | undefined {
    let closest_unit = units_table[0];
    if (closest_unit) {
        let min_distance = (point.__sub(EntIndexToHScript(closest_unit)!.GetAbsOrigin())).Length();
        for (const unit_index of units_table) {
            let distance = (point.__sub(EntIndexToHScript(unit_index)!.GetAbsOrigin())).Length();
            if (distance < min_distance) {
                closest_unit = unit_index;
                min_distance = distance;
            }
        }
        return closest_unit;
    }
    else {
        return undefined;
    }
}

function GetRowsAndColumnsForMaxColumns(numUnits: number, total: number, numColumns: number): [number, number] {
    if (numColumns <= 4) {
        return GetRowsAndColumns(numUnits, total);
    }
    else {
        let rows = math.floor(math.sqrt(numUnits / 1.3));
        let columns = math.min(numUnits, numColumns);
        return [rows, columns];
    }
}

function MoveUnitsInGrid(units: EntityIndex[], point: Vector, order_type: UnitOrder, queue: boolean, forward: Vector): void {
    if (!units[0]) {
        return;
    }
    let first_unit = EntIndexToHScript(units[0]);
    let origin = first_unit!.GetAbsOrigin();
    forward = forward || (point.__sub(origin)).Normalized();
    if (forward.x === 0) {
        forward.x = 0.5;
    }
    if (forward.y === 0) {
        forward.y = 0.5;
    }
    let right = RotatePosition(Vector(0, 0, 0), QAngle(0, 90, 0), forward);
    let usedRows = 0;
    let N = units.length;
    let unitsRank = [];
    let numUnitsPerRank = [];
    let maxColumns = 0;
    for (let i = 0; i <= 5; i++) {
        unitsRank[i] = GetUnitsWithFormationRank(units, i);
        if (unitsRank[i]) {
            numUnitsPerRank[i] = unitsRank[i]!.length;
            let [r, c] = GetRowsAndColumns(numUnitsPerRank[i], N);
            if (c > maxColumns) {
                maxColumns = c;
            }
        }
    }

    for (let rank = 0; rank < unitsRank.length; rank++) {
        const unitsByRank = unitsRank[rank];
        if (DEBUG) {
            DebugDrawCircle(point, Vector(255, 0, 0), 100, 18, true, 3);
        }
        let numUnits = numUnitsPerRank[rank];
        let rows = 1;
        let columns = 1;
        let remainderFactor = 1;
        let offsetX = UNIT_FORMATION_DISTANCE;
        let offsetY = UNIT_FORMATION_DISTANCE;
        let center;
        if (Number(rank) === 5) {
            offsetX = UNIT_FORMATION_DISTANCE_LARGE;
            offsetY = UNIT_FORMATION_DISTANCE_LARGE;
            center = point.__sub(forward.__mul(UNIT_FORMATION_DISTANCE * usedRows).__sub(forward.__mul(UNIT_FORMATION_DISTANCE_LARGE / 3)));
        }
        else {
            center = point.__sub(forward.__mul(UNIT_FORMATION_DISTANCE * usedRows));
        }
        if (numUnits === 1) {
            ExecuteOrderFromTable({ UnitIndex: unitsByRank![0], OrderType: order_type, Position: center, Queue: queue });
        }
        else {
            let navPoints: Vector[] = [];
            let squareFactor = 1;
            [rows, columns] = GetRowsAndColumnsForMaxColumns(numUnits, N, maxColumns);
            let row_len = offsetX * (maxColumns - 1);
            if (columns !== maxColumns) {
                let sub_row_len = offsetX * (columns - 1);
                let rowFactor = row_len / sub_row_len;
                if (rowFactor > 0) {
                    offsetX = offsetX * rowFactor;
                }
            }
            let remainder = numUnits - rows * columns;
            let rem_len = offsetX * (remainder - 1);
            if (rem_len > 0) {
                remainderFactor = row_len / rem_len;
            }
            let start = (columns - 1) * -0.5;
            let curX = start;
            let curY = 0;
            for (let i = 1; i <= rows; i++) {
                for (let j = 1; j <= columns; j++) {
                    let newPoint = center.__add(right.__mul(curX * offsetX)).__add(forward.__mul(curY * offsetY))
                    if (DEBUG) {
                        DebugDrawCircle(newPoint, Vector(0, 0, 0), 255, 25, true, 5);
                        DebugDrawText(newPoint, curX + (", " + curY), true, 10);
                    }
                    navPoints.push(newPoint)
                    curX = curX + 1;
                }
                curX = start;
                curY = curY - 1;
            }
            curX = (remainder - 1) * -0.5;
            offsetX = offsetX * remainderFactor;
            for (let i = 1; i <= remainder; i++) {
                let newPoint = center.__add(right.__mul(curX * offsetX)).__add(forward.__mul(curY * offsetY))
                if (DEBUG) {
                    DebugDrawCircle(newPoint, Vector(0, 0, 255), 255, 25, true, 5);
                    DebugDrawText(newPoint, curX + (", " + curY), true, 10);
                }
                navPoints.push(newPoint)
                curX = curX + 1;
            }
            if (remainder > 0) {
                usedRows = usedRows + 1;
            }
            let sortedUnits: EntityIndex[] = []
            for (let i = 1; i <= navPoints.length; i++) {
                let closest_unit_index = GetClosestUnitToPoint(unitsByRank!, navPoints[i]);
                if (closest_unit_index) {
                    sortedUnits.push(closest_unit_index)
                    unitsByRank?.splice(unitsByRank.indexOf(closest_unit_index), 1)
                }
            }
            let n = 0;
            for (const unit_index of sortedUnits) {
                let unit = EntIndexToHScript(unit_index);
                let pos = navPoints[n + 1];
                n = n + 1;
                ExecuteOrderFromTable({ UnitIndex: unit_index, OrderType: order_type, Position: pos, Queue: queue });
            }
        }
        usedRows = usedRows + rows;
    }
}

export function IsUprooted(unit: CDOTA_BaseNPC) {
    return unit.HasModifier("modifier_uprooted")
}

export function FindAlliesInRadius(unit: CDOTA_BaseNPC, radius: number, point: Vector) {
    const team = unit.GetTeamNumber()
    const position = point || unit.GetAbsOrigin()

    const target_type = UnitTargetType.HERO + UnitTargetType.BASIC
    const flags = UnitTargetFlags.INVULNERABLE
    return FindUnitsInRadius(team, position, undefined, radius, UnitTargetTeam.FRIENDLY, target_type, flags, FindOrder.CLOSEST, false)
}

export function IsCustomBuilding(unit: CDOTA_BaseNPC) {
    return unit.HasModifier("modifier_building") || IsUprooted(unit);
}

// TODO
export function HasTrainAbility(unit: CDOTA_BaseNPC) {
    for (let i = 0; i < 15; i++) {
        const ability = unit.GetAbilityByIndex(i)
        if (ability?.GetAbilityName().includes("train_")) {
            return true
        }
    }

    return false
}

// Auxiliar function that goes through every ability and item, checking for any ability being channelled
export function IsChanneling(unit: CDOTA_BaseNPC) {
    for (let i = 0; i < 15; i++) {
        const ability = unit.GetAbilityByIndex(i)
        if (ability && ability.IsChanneling())
            return ability;
    }

    for (let i = 0; i < 5; i++) {
        const ability = unit.GetItemInSlot(i)
        if (ability && ability.IsChanneling())
            return ability;
    }

    return false;
}

// todo
export function GetUnitRace(unit: CDOTA_BaseNPC): RaceType {
    return "undead"
    // unit.getrace
}

export function IsNightElf(unit: CDOTA_BaseNPC) {
    return GetUnitRace(unit) == "nightelf"
}


export function GetFoodProduced(unit: CDOTA_BaseNPC): number {
    if (unit && IsValidEntity(unit)) {
        if (GameRules.UnitKV[unit.GetUnitName()] && GameRules.UnitKV[unit.GetUnitName()].FoodProduced) {
            return GameRules.UnitKV[unit.GetUnitName()].FoodProduced;
        }
    }
    return 0;
}

export function IsCityCenter(unit: CDOTA_BaseNPC): boolean {
    return IsCustomBuilding(unit) && unit.GetUnitLabel().includes("city_center");
}

export function CanGatherTree(unit: CDOTA_BaseNPC): boolean {
    return (unit.GetKeyValue<string>("GatherResources") || "").includes("lumber")
}

// logging

export function log(...args: any[]) {
    print(`[WC] `, ...args)
}

export function IsUndead(unit: CDOTA_BaseNPC): boolean {
    return GetUnitRace(unit) === "undead";
}