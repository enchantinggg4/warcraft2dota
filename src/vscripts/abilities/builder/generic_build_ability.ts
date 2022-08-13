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

    public GetKeyValue<T = unknown>(key: string): T {
        return (this.GetAbilityKeyValues() as any)[key];
    }


    public GetBuildInfo(): BuildInfo {
        return {
            gold: this.GetSpecialValueFor("gold_cost"),
            lumber: this.GetSpecialValueFor("lumber_cost"),
            buildTime: this.GetSpecialValueFor("build_time"),
        }
    }
}