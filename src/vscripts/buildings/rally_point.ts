import { registerEntityFunction } from "../lib/dota_ts_adapter";
import { ResearchManager, ResearchMap } from "../ResearchManager";
import { Building, EnqueueEvt } from "../types/gen";
import { IsBuilder } from "../util/munits";
import { RepositionAroundRallyPoint } from "../util/Utility";

interface Ext {
    UnitName: string;
    target?: CDOTA_BaseNPC
}
export function SpawnUnit(this: void, event: EnqueueEvt & Ext) {
    const { caster, UnitName } = event;
    const playerID = caster.GetMainControllingPlayer() as PlayerID;
    const hero = caster.GetOwner();

    const position = caster.initial_spawn_position!

    const teamID = caster.GetTeamNumber()


    let unitName = UnitName;
    // Adjust mountain giant secondary unit
    if (ResearchManager.HasResearch(playerID, ResearchMap.NightElfResistantSkin)) {
        unitName = `${unitName}_resistant_skin`
    }

    // Adjust troll berserker upgraded unit
    if (ResearchManager.HasResearch(playerID, ResearchMap.OrcBerserker)) {
        unitName = `orc_troll_berserker`
    }

    const unit = CreateUnitByName(unitName, position, true, hero, hero, caster.GetTeamNumber());
    unit.AddNewModifier(caster, undefined, "modifier_phased", { duration: 0.03 });
    unit.SetOwner(hero);
    unit.SetControllableByPlayer(playerID, true);

    event.target = unit;
    MoveToRallyPoint(event);


    // Recolor huskar
    if (unitName.includes("orc_troll_berserker")) {
        unit.SetRenderColor(255, 255, 0);
    }
}

// Queues a movement command for the spawned unit to the rally point
// Also adds the unit to the players army and looks for upgrades
export function MoveToRallyPoint(event: EnqueueEvt & Ext) {
    const { caster, target } = event;

    const entityIndex = target!.GetEntityIndex(); // -- Spawned unit
    const playerID = caster.GetMainControllingPlayer();

    // Set the builders idle when they spawn
    if (IsBuilder(target!)) {
        target!.state = "idle"
    }
}

function GetRallyPointPosition(building: Building): Vector {
    let flag_type = building.flag_type;
    let position: Vector | undefined = building.GetAbsOrigin().__add(building.GetForwardVector().__mul(250))
    if (flag_type === "tree") {
        position = (building.flag as CDOTA_BaseNPC).GetAbsOrigin();
    }
    else if (flag_type === "position") {
        position = (building.flag as Vector)
    }
    else if (flag_type === "target" || flag_type == "mine") {
        const target = building.flag
        if (target && IsValidEntity(target) && target.IsAlive()) {
            position = target.GetAbsOrigin();
        }
        else {
            position = building.initial_spawn_position;
        }
    }
    return position!;
}

function GetRallySpawnPointPosition(building: Building): Vector {
    let rally_point = GetRallyPointPosition(building);
    let origin = building.GetAbsOrigin();
    let towardsTarget = (rally_point.__sub(building.GetAbsOrigin())).Normalized();
    return origin.__add(towardsTarget.__mul(building.GetCollisionSize()));
}

export function GetInitialRallyPoint(event: EnqueueEvt): Vector | undefined {
    let caster = event.caster;
    let rally_spawn_position = GetRallySpawnPointPosition(caster);
    if (rally_spawn_position) {
        return rally_spawn_position;
    }
    else {
        print("Fail, no rally point position, this shouldnt happen");
    }
    return undefined;
}




function ResolveRallyPointOrder(unit: CDOTA_BaseNPC, building: Building) {
    const entityIndex = unit.GetEntityIndex()
    const flag = building.flag
    const rally_type = building.flag_type

    Timers.CreateTimer(0.05, () => {

        // Move to Position
        if (rally_type == "position") {

            // Reposition units nearby the rally flag, including the newly created unit
            RepositionAroundRallyPoint(unit, building, flag as Vector)

            // Move to follow NPC
        } else if (rally_type == "target") {
            unit.MoveToNPC(flag as CDOTA_BaseNPC)
            // Move to Gather Tree
        } else if (rally_type == "tree") {
            if (unit.IsGatherer()) {
                unit.GatherFromNearestTree((flag as CDOTA_BaseNPC).GetAbsOrigin())
            } else {
                // Move
                unit.MoveToPosition((flag as CDOTA_BaseNPC).GetAbsOrigin())
            }

            // Move to Gather Gold
        } else if (rally_type == "mine") {
            if (unit.IsGatherer()) {
                unit.GatherFromNearestGoldMine(flag as CDOTA_BaseNPC)
            } else {
                // Move
                unit.MoveToPosition((flag as CDOTA_BaseNPC).GetAbsOrigin())
            }
        }
    })
}




// Registers
registerEntityFunction('GetInitialRallyPoint', (evt) => GetInitialRallyPoint(evt));
registerEntityFunction('MoveToRallyPoint', (evt) => MoveToRallyPoint(evt));
