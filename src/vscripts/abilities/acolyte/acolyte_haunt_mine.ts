import { BuildManager } from "../../BuildManager";
import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../lib/dota_ts_adapter";
import { modifier_generic_build_timer } from "../../modifiers/building/modifier_generic_build_timer";
import { modifier_gold_mine } from "../../modifiers/modifier_gold_mine";
import { modifier_gold_mine_haunted } from "../../modifiers/modifier_gold_mine_haunted";
import { HauntedGoldMine } from "../../types/GoldMine";


@registerModifier()
export class modifier_out_of_world extends BaseModifier {

    CheckState(){
        return {
            [ModifierState.OUT_OF_GAME]: true,
            [ModifierState.UNSELECTABLE]: true
        }
    }
}

@registerAbility()
export class acolyte_haunt_mine extends BaseAbility {

    CastFilterResultTarget(target: CDOTA_BaseNPC): UnitFilterResult {
        if (target.HasModifier(modifier_gold_mine.name)) {
            return UnitFilterResult.SUCCESS
        }

        return UnitFilterResult.FAIL_OTHER;
    }

    GetBehavior(): AbilityBehavior {
        return AbilityBehavior.UNIT_TARGET;
    }

    GetAbilityTargetTeam(): UnitTargetTeam {
        return UnitTargetTeam.ENEMY
    }

    GetAbilityTargetType(): UnitTargetType {
        return UnitTargetType.BUILDING;
    }

    OnSpellStart(): void {
        const oldMine = this.GetCursorTarget()!;

        // Hide old neutral mine
        oldMine.AddNoDraw();
        oldMine.AddNewModifier(oldMine, undefined, "modifier_invulnerable", { duration: -1 });
        oldMine.AddNewModifier(oldMine, undefined, modifier_out_of_world.name, { duration: - 1});


        const playerId = this.GetCaster().GetMainControllingPlayer() as PlayerID;
        const player = PlayerResource.GetPlayer(playerId)!;



        const mine = BuildManager.Build(
            "npc_dota_building_haunted_mine",
            oldMine.GetAbsOrigin(),
            player,
            1 // todo remove hardcode
        ) as HauntedGoldMine;
        mine.workerList = [undefined, undefined, undefined, undefined, undefined];
        // Create new mine with my team

        mine.AddNewModifier(mine, undefined, modifier_gold_mine_haunted.name, { duration: -1, mineEntityId: +oldMine.entindex() });
        mine.goldMineEntityId = oldMine.entindex()
    }

}
