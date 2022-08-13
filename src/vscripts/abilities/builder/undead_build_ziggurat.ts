import { BuildManager } from "../../BuildManager";
import { registerAbility } from "../../lib/dota_ts_adapter";
import { generic_build_ability } from "./generic_build_ability";

@registerAbility()
export class undead_build_ziggurat extends generic_build_ability {

    OnSpellStart(): void {
        BuildManager.InitBuild(this.GetOwner() as any, this);
    }
}