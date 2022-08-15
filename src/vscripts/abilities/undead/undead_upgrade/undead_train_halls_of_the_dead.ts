import { registerAbility } from "../../../lib/dota_ts_adapter";
import { generic_unit_train, generic_upgrade } from "../../generic_unit_train";

@registerAbility()
export class undead_train_halls_of_the_dead extends generic_upgrade {
    // todo move type to unitmap
    upgradeToUnit: string = "undead_halls_of_the_dead";

    GetChannelTime(): number {
        return 10
    }

}