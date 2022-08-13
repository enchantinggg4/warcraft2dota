import { generic_build_ability } from "./abilities/builder/generic_build_ability";
import { modifier_generic_build_timer } from "./modifiers/building/modifier_generic_build_timer";
import { ResourceManager } from "./ResourceManager";
import { Units } from "./util/Units";
import { SendErrorMessage } from "./util/Utility";

export class BuildManager {



    public static Build(
        unitName: string,
        position: Vector,
        player: CDOTAPlayerController,
        buildTime: number = 10 // TODO: where do we get this??

    ): CDOTA_BaseNPC {
        const mine = CreateUnitByName(unitName, position, false, player, player, player.GetTeam());
        mine.RemoveModifierByName("modifier_invulnerable");

        mine.AddNewModifier(mine, undefined, "modifier_generic_building", { duration: -1 });
        mine.AddNewModifier(mine, undefined, modifier_generic_build_timer.name, { duration: buildTime });

        return mine;
    }


    public static InitBuild(caster: CDOTA_BaseNPC, ability: generic_build_ability) {
        const evt = {
            caster,
            ability,
        };


        const ability_name = ability.GetAbilityName()
        const building_name = ability.GetKeyValue<string>("UnitName")

        const buildCost = ability.GetBuildInfo();

        const construction_size = BuildingHelper.GetConstructionSize(building_name)
        const construction_radius = construction_size * 64 - 32

        // const hero = caster.IsRealHero() and caster or caster:GetOwner()
        const playerID = (caster as CDOTA_BaseNPC).GetMainControllingPlayer() as PlayerID;
        const player = PlayerResource.GetPlayer(playerID)
        const teamNumber = caster.GetTeam()

        if (BuildingHelper.AddBuilding(evt)) {
            
            evt.OnPreConstruction(function(){
                print('BM: On pre construction');
                // Hacks!
                // @ts-ignore
                const vPos: Vector = this;

                // Enemy unit check
                const enemies = FindUnitsInRadius(
                    teamNumber,
                    vPos,
                    undefined,
                    construction_size,
                    UnitTargetTeam.ENEMY,
                    UnitTargetType.HERO + UnitTargetType.BASIC,
                    UnitTargetFlags.MAGIC_IMMUNE_ENEMIES + UnitTargetFlags.FOW_VISIBLE + UnitTargetFlags.NO_INVIS,
                    FindOrder.ANY,
                    false
                )

                if (enemies.length > 0) {
                    SendErrorMessage(playerID, "#error_invalid_build_position")
                    return false
                };



                // Blight check
                if (building_name.includes("undead") && building_name != Units.NECROPOLIS) {
                    const bHasBlight = BuildingHelper.PositionHasBlight(vPos)
                    print(`Blight check for ${building_name}: ${bHasBlight}`)
                    if (!bHasBlight) {
                        SendErrorMessage(playerID, "#error_must_build_on_blight")
                        return false
                    }
                }

                // TODO
                // -- Proximity to gold mine check for Human/Orc: Main Buildings can be as close as 768 towards the center of the Gold Mine.
                // if HasGoldMineDistanceRestriction(building_name) then
                //     local nearby_mine = Entities:FindAllByNameWithin("*gold_mine", vPos, 768)
                //     if #nearby_mine > 0 then
                //         SendErrorMessage(caster:GetPlayerOwnerID(), "#error_too_close_to_goldmine")
                //         return false
                //     end
                // end

                if (!ResourceManager.HasEnoughResources(playerID, buildCost)) {
                    return false;
                }
            });

            evt.OnBuildingPosChosen(function(){
                print('BM: On pos chosen');
                
                // Hacks!
                // @ts-ignore
                const vPos: Vector = this;

                // Spend resources
                ResourceManager.ModifyResources(
                    playerID,
                    -buildCost.gold,
                    -buildCost.lumber
                );

                // TODO
                // // Play a sound
                // Sounds:EmitSoundOnClient(playerID, "Building.Placement")

                // Move allied units away from the building place
                const units = FindUnitsInRadius(teamNumber, vPos, undefined, construction_radius, UnitTargetTeam.FRIENDLY, UnitTargetType.BASIC + UnitTargetType.HERO, 0, FindOrder.ANY, false);
                units.forEach(unit => {
                    if (unit != caster) {
                        print(`TODO: move ${unit.GetUnitName()} out of building area!`);
                    }

                });

            })

            evt.OnConstructionCompleted((unit) => {

            })


            evt.OnConstructionStarted(function(){
                
                // Hacks!
                // @ts-ignore
                const unit: CDOTA_BaseNPC = this;

                print("Started construction of " + unit.GetUnitName() + " " + unit.GetEntityIndex());
                // Play construction sound

                // Adjust health for human research
                // const masonry_rank = Players:GetCurrentResearchRank(playerID, "human_research_masonry")
                // const maxHealth = unit.GetMaxHealth() * (1 + 0.2 * masonry_rank)
                // unit.SetMaxHealth(maxHealth)
                // unit.SetBaseMaxHealth(maxHealth)

                // if (unit.RenderTeamColor()){
                //     local color = dotacraft:ColorForTeam(teamNumber)
                //     unit:SetRenderColor(color[1], color[2], color[3])
                // }

                // Move allied units away from the building place
                // const vPos = unit:GetAbsOrigin()
                // const units = FindUnitsInRadius(teamNumber, vPos, nil, construction_radius, DOTA_UNIT_TARGET_TEAM_FRIENDLY, DOTA_UNIT_TARGET_BASIC + DOTA_UNIT_TARGET_HERO, 0, FIND_ANY_ORDER, false)
                // for _,unit in pairs(units) do
                //     if unit ~= caster and not IsCustomBuilding(unit) then
                //         unit:FindClearSpace()
                //     end
                // end

                // Units can't attack while building
                // unit.original_attack = unit:GetAttackCapability()
                // unit:SetAttackCapability(DOTA_UNIT_CAP_NO_ATTACK)

                // Give item to cancel
                // const item = CreateItem("item_building_cancel", nil, nil)
                // unit:AddItem(item)

                // FindClearSpace for the builder
                FindClearSpaceForUnit(caster, caster.GetAbsOrigin(), true)
                caster.AddNewModifier(caster, undefined, "modifier_phased", { duration: 0.03 })

                // Remove invulnerability on npc_dota_building baseclass
                unit.RemoveModifierByName("modifier_invulnerable")

                // Particle effect
                // ApplyModifier(unit, "modifier_construction")

                // Check the abilities of this building, disabling those that don't meet the requirements
                // CheckAbilityRequirements(unit, playerID)
                // unit.ApplyRankUpgrades()

                // Add roots to ancient
                // local ancient_roots = unit: FindAbilityByName("nightelf_uproot")
                // if ancient_roots then
                // ancient_roots: ApplyDataDrivenModifier(unit, unit, "modifier_rooted_ancient", {})
                // end

                // Apply altar linking
                if (unit.GetUnitName().includes("altar")) {
                    // TeachAbility(unit, "ability_altar")
                }
            })

            evt.OnConstructionFailed(() => {
                const playerTable = BuildingHelper.GetPlayerTable(playerID)
                const name = playerTable.activeBuilding

                print("BM: Failed placement of " + name)
                SendErrorMessage(caster.GetPlayerOwnerID(), "#error_invalid_build_position")
            });


            evt.OnConstructionCancelled(function(){
                
                // Hacks!
                // @ts-ignore
                const work: any = this;

                const name = work.name
                const building = work.building // Used on repair

                if (building) {
                    // Toggle off
                    // const repair_ability = BuildingHelper:GetRepairAbility(caster)
                    // if repair_ability and repair_ability:GetToggleState() then repair_ability:ToggleAbility() end 
                }
                else {
                    // print("Cancelled construction of " .. name)

                    // Refund resources for this cancelled work
                    if (work.refund) {
                        // if (ability.GetKeyValue("ItemInitialCharges")){
                        //     ability:SetCurrentCharges(ability:GetCurrentCharges()+1)
                        // }
                        ResourceManager.ModifyResources(
                            playerID,
                            buildCost.gold,
                            buildCost.lumber
                        )
                    }
                }
            });

            evt.OnAboveHalfHealth(() => {
                print('above 50%')
            })

            evt.OnBelowHalfHealth(() => {
                print('below 50%')
            })
        }
    }
}