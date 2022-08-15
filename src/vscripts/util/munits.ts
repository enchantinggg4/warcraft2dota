import { Queue } from "../buildings/queue";
import { modifier_harvest_tree } from "../modifiers/worker/modifier_harvest_tree";
import { FindEmptyNavigableTreeNearby, IsCustomBuilding, IsValidAlive, tobool } from "./Utility";

interface Unit extends CDOTA_BaseNPC {
    bFirstSpawned?: boolean
}


export class Units {

    public static Init(unit: Unit) {
        if (unit.bFirstSpawned && !unit.IsRealHero()) return;

        unit.bFirstSpawned = true;

        // Apply armor and damage modifier (for visuals)
        const attackType = unit.GetAttackType();
        if (attackType && unit.GetAttackDamage() > 0) {
            unit.AddNewModifier(unit, undefined, `modifier_attack_${attackType}`, {});
        }

        const armorType = unit.GetArmorType()
        if (armorType) {
            unit.AddNewModifier(unit, undefined, `modifier_armor_${armorType}`, {});
        }


        if (unit.HasSplashAttack()) {
            unit.AddNewModifier(unit, undefined, `modifier_splash_attack`, {});
        }

        const bBuilder = IsBuilder(unit)
        const bBuilding = IsCustomBuilding(unit)

        if (bBuilder) {
            unit.IsIdle = function () {
                return !unit.IsMoving() && unit.state == 'idle'
            }
        }


        const attacksEnabled = unit.GetAttacksEnabled()
        if (attacksEnabled != "none") {
            if (bBuilder || unit.GetUnitName() == "neutral_goblin_sapper") {
                unit.AddNewModifier(unit, undefined, "modifier_attack_system_passive", {})
            } else {
                unit.AddNewModifier(unit, undefined, "modifier_attack_system", {});
            }

            // Neutral AI aggro and leashing
            if (unit.IsNeutral()) {
                unit.AddNewModifier(unit, undefined, "modifier_neutral_idle_aggro", {});
                // NeutralAI.Start(unit)
            }
        }


        unit.AddNewModifier(unit, undefined, "modifier_specially_deniable", {});

        // Adjust hull
        unit.AddNewModifier(undefined, undefined, "modifier_phased", { duration: 0.1 })
        const collisionSize = unit.GetCollisionSize()
        if (!bBuilding && collisionSize) {
            unit.SetHullRadius(collisionSize);
        }


        // Disable gold bounty for non neutral kills
        if (unit.GetTeamNumber() != DotaTeam.NEUTRALS) {
            unit.SetMaximumGoldBounty(0)
            unit.SetMinimumGoldBounty(0)
        }


        // Special tree-attacking unit
        if (unit.GetKeyValue("AttacksTrees")) {
            unit.AddNewModifier(unit, undefined, modifier_harvest_tree.name, {});
        }


        // Store autocast abilities to iterate over them later. Note that we also need to store more abilities after research
        // local autocast_abilities = {}
        // for i=0,15 do
        //     local ability = unit:GetAbilityByIndex(i)
        //     if ability and ability:HasBehavior(DOTA_ABILITY_BEHAVIOR_AUTOCAST) then
        //         table.insert(autocast_abilities, ability)
        //     end
        // end
        // if #autocast_abilities > 0 then
        //     unit.autocast_abilities = autocast_abilities
        // end

        Timers.CreateTimer(0.03, () => {
            if (!IsValidAlive(unit)) return;

            // -- Builder items
            // if bBuilder and not unit:HasModifier("modifier_kill") then
            //     local owner = unit:GetOwner()
            //     local items = Units:GetBuilderItemsForRace(unit:GetRace())
            //     for _,itemName in pairs(items) do
            //         unit:AddItem(CreateItem(itemName, owner, unit))
            //     end
            // end

            // -- Flying Height Z control
            // if unit:GetKeyValue("MovementCapabilities") == "DOTA_UNIT_CAP_MOVE_FLY" then
            //     unit:AddNewModifier(unit,nil,"modifier_flying_control",{})
            // end

            // Building Queue
            if (unit.GetKeyValue("HasQueue")){
                Queue.Init(unit)
            }

            // if unit:IsCreature() and PlayerResource:IsValidPlayerID(unit:GetPlayerOwnerID()) then
            //     unit:ApplyRankUpgrades()
            // end
        })

    }



}





























export function IsBuilder(unit: CDOTA_BaseNPC) {
    const label = unit.GetUnitLabel()
    if (label == "builder") {
        return true
    }
    const table = CustomNetTables.GetTableValue("builders", tostring(unit.GetEntityIndex()))
    if (table) {
        return tobool(table["IsBuilder"])
    } else return false;
}
