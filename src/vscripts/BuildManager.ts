import { modifier_generic_build_timer } from "./modifiers/building/modifier_generic_build_timer";

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
}