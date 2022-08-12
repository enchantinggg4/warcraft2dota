import { BaseModifier, registerModifier } from "../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_harvest_tree extends BaseModifier {

    DeclareFunctions(){
        return [
            ModifierFunction.CAN_ATTACK_TREES
        ]
    }

    GetModifierCanAttackTrees(): 1 | 0 {
        return 1;
    }

}