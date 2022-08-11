import { registerAbility, registerModifier } from "../lib/dota_ts_adapter";
import { modifier_train_unit } from "../modifiers/modifier_train_unit";
import { generic_unit_train } from "./generic_unit_train";


@registerModifier()
export class modifier_train_acolyte extends modifier_train_unit {
    modifier_texture: string = "acolyte";
}

@registerAbility()
export class train_acolyte extends generic_unit_train {

    modifier_name: string = modifier_train_acolyte.name;

    unit_name: string = "npc_dota_undead_acolyte";

}
