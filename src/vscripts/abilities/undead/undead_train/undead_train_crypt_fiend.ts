import { registerAbility } from "../../../lib/dota_ts_adapter";
import { generic_unit_train } from "../../generic_unit_train";

@registerAbility()
export class undead_train_crypt_fiend extends generic_unit_train {
    GetChannelTime(): number {
        return 3.0
    }

}