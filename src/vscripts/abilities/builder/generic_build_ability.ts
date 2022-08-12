import { BaseAbility } from "../../lib/dota_ts_adapter";


export interface BuildInfo {
    gold: number;
    lumber: number;
    buildTime: number;
}

export abstract class generic_build_ability extends BaseAbility {


    GetBehavior(): AbilityBehavior | Uint64 {
        return AbilityBehavior.NO_TARGET | AbilityBehavior.IMMEDIATE
    }



    protected GetBuildInfo(): BuildInfo {
        return {
            gold: this.GetSpecialValueFor("gold_cost"),
            lumber: this.GetSpecialValueFor("lumber_cost"),
            buildTime: this.GetSpecialValueFor("build_time"),
        }
    }
}