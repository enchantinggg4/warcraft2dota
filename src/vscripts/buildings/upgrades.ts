
import { ResourceManager } from "../ResourceManager";
import { Building, EnqueueEvt } from "../types/gen";
import { GetFoodProduced, IsCityCenter, IsValidAlive, log } from "../util/Utility";

interface Ext {
    ModifierName?: string;
}

export function StartUpgrade(event: EnqueueEvt & Ext): void {
    let caster = event.caster;
    let ability = event.ability;
    let modifier_name = event.ModifierName;
    let lumberCost = event.ability.GetSpecialValueFor("lumber_cost");
    const goldCost = event.ability.GetSpecialValueFor("gold_cost")
    let playerID = caster.GetMainControllingPlayer() as PlayerID;


    log(lumberCost, ResourceManager.GetLumber(playerID), playerID)
    if (lumberCost && lumberCost > ResourceManager.GetLumber(playerID)) {
        return;
    }

    if (goldCost && goldCost > ResourceManager.GetGold(playerID)) {
        return;
    }

    let abilities: CDOTABaseAbility[] = []
    for (let i = 0; i <= 15; i++) {
        let abil = caster.GetAbilityByIndex(i);
        if (abil) {
            let ability_name = abil.GetName();
            if (string.match(ability_name, "train_") || string.match(ability_name, "research_")) {
                abilities.push(abil)
            }
        }
    }
    caster.disabled_abilities = abilities;
    caster.original_attack = caster.GetAttackCapability();
    caster.SetAttackCapability(UnitAttackCapability.NO_ATTACK);
    for (const disable_ability of abilities) {
        disable_ability.SetHidden(true);
    }
    // if (modifier_name) {
    //     ability.ApplyDataDrivenModifier(caster, caster, modifier_name, {});
    //     caster.upgrade_modifier = modifier_name;
    // }

    // TODO?
    // FireGameEvent("ability_values_force_check", { player_ID: playerID });
}


export function CancelUpgrade({ caster }: EnqueueEvt): void {
    let abilities = caster.disabled_abilities || [];
    let playerID = caster.GetMainControllingPlayer() as PlayerID;
    caster.SetAttackCapability(caster.original_attack!);
    for (const ability of abilities) {
        ability.SetHidden(false);
    }
    // let upgrade_modifier = caster.upgrade_modifier;
    // if (upgrade_modifier && caster.HasModifier(upgrade_modifier)) {
    //     caster.RemoveModifierByName(upgrade_modifier);
    // }
    // FireGameEvent("ability_values_force_check", { player_ID: playerID });
}

export function UpgradeBuilding(event: EnqueueEvt & { UnitName: string }): void {
    let caster = event.caster;
    let new_unit = event.UnitName;
    let position = caster.GetAbsOrigin();
    let playerID = caster.GetMainControllingPlayer() as PlayerID;
    let player = PlayerResource.GetPlayer(playerID);
    let currentHealthPercentage = caster.GetHealthPercent() * 0.01;
    // let blockers = caster.blockers;
    let hull_radius = caster.GetHullRadius();
    let flag = caster.flag;
    let flag_type = caster.flag_type;
    let angle = caster.GetAngles();
    let bApplyBlight = caster.HasModifier("modifier_grid_blight");
    let building = BuildingHelper.UpgradeBuilding<Building>(caster, new_unit);
    building.SetHullRadius(hull_radius);
    building.flag = flag;

    // TODO
    // if (PlayerResource.IsUnitSelected(playerID, caster)) {
    //     PlayerResource.AddToSelection(playerID, building);
    // }

    let old_food = GetFoodProduced(caster);
    let new_food = GetFoodProduced(building);
    if (new_food !== old_food) {
        ResourceManager.ModifyFoodLimit(playerID, new_food - old_food);
    }
    let ancient_roots = building.FindAbilityByName("nightelf_uproot");
    if (ancient_roots) {
        // todo
        // ancient_roots.ApplyDataDrivenModifier(building, building, "modifier_rooted_ancient", {});
    }
    if (bApplyBlight) {
        building.AddNewModifier(building, undefined, "modifier_grid_blight", {});
    }
    if (IsCityCenter(building)) {
        let level = building.GetLevel();
        let city_center_level = ResourceManager.GetCityLevel(playerID);

        // TODO
        // PlayerResource.SetDefaultSelectionEntity(playerID, building);
        if (level > city_center_level) {
            ResourceManager.SetCityCenterLevel(playerID, level);
        }
    }
    let entangled_gold_mine = caster.entangled_gold_mine;
    if (IsValidAlive(entangled_gold_mine)) {
        // TODO
        // entangled_gold_mine.city_center = building;
        building.entangled_gold_mine = caster.entangled_gold_mine;
        building.SwapAbilities("nightelf_entangle_gold_mine", "nightelf_entangle_gold_mine_passive", false, true);
    }

    // TODO
    // Players.UpgradeStructure(playerID, caster, building);

    caster.RemoveSelf();
    let newRelativeHP = math.max(building.GetMaxHealth() * currentHealthPercentage, 1);
    building.SetHealth(newRelativeHP);


    // TODO
    // let playerUnits = Players.GetUnits(playerID);
    // for (const [k, unit] of pairs(playerUnits)) {
    //     CheckAbilityRequirements(unit, playerID);
    // }
    // let playerStructures = Players.GetStructures(playerID);
    // for (const [k, structure] of pairs(playerStructures)) {
    //     CheckAbilityRequirements(structure, playerID);
    // }
}