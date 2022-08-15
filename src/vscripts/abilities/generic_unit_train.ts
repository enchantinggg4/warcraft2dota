import { EnqueueUnit, NextQueue } from "../buildings/queue";
import { GetInitialRallyPoint, SpawnUnit } from "../buildings/rally_point";
import { BaseAbility, registerAbility } from "../lib/dota_ts_adapter";
import { Cost } from "../Money";
import { log } from "../util/Utility";
import { IUnitTrain } from "./IUnitTrain";

export abstract class generic_unit_train extends BaseAbility {

    abstract GetChannelTime(): number

    GetBehavior(): AbilityBehavior | Uint64 {
        return AbilityBehavior.NO_TARGET// + AbilityBehavior.
    }

    OnSpellStart() {
        EnqueueUnit({ caster: this.GetCaster(), ability: this });
        log(`${this.GetAbilityName()} unit enqueued`)
    }

    OnChannelFinish(interrupted: boolean): void {
        log(`${this.GetAbilityName()} channel ${interrupted ? 'interrupted' : 'successful'}`)

        if (interrupted) return;

        const unitName = this.GetAbilityName().replaceAll("_train", "");
        SpawnUnit({ caster: this.GetCaster(), ability: this, UnitName: unitName })
        NextQueue({ caster: this.GetCaster(), ability: this });
    }

}


