import { EnqueueUnit, NextQueue } from "../buildings/queue";
import { GetInitialRallyPoint, SpawnUnit } from "../buildings/rally_point";
import { UpgradeBuilding } from "../buildings/upgrades";
import { BaseAbility, registerAbility } from "../lib/dota_ts_adapter";
import { EnqueueEvt } from "../types/gen";
import { log } from "../util/Utility";

export abstract class generic_unit_train extends BaseAbility {

    abstract GetChannelTime(): number

    GetBehavior(): AbilityBehavior | Uint64 {
        return AbilityBehavior.NO_TARGET// + AbilityBehavior.
    }

    OnSpellStart() {

        const evt = { caster: this.GetCaster(), ability: this, ...this.GetEnqueueEventSpawn() };
        EnqueueUnit(evt);
        log(`${this.GetAbilityName()} unit enqueued`)
    }

    GetEnqueueEventSpawn(): any {
        return {};
    }

    OnChannelFinish(interrupted: boolean): void {
        log(`${this.GetAbilityName()} channel ${interrupted ? 'interrupted' : 'successful'}`)

        if (interrupted) return;

        const unitName = this.GetAbilityName().replaceAll("_train", "");

        SpawnUnit({ caster: this.GetCaster(), ability: this, UnitName: unitName })
        NextQueue({ caster: this.GetCaster(), ability: this });
    }

}

export abstract class generic_upgrade extends generic_unit_train {

    abstract upgradeToUnit: string;

    GetEnqueueEventSpawn() {
        return {
            Action: "StartUpgrade"
        }
    }

    OnChannelFinish(interrupted: boolean): void {
        log(`${this.GetAbilityName()} channel ${interrupted ? 'interrupted' : 'successful'}`)

        if (interrupted) return;

        NextQueue({ caster: this.GetCaster(), ability: this });

        UpgradeBuilding({ caster: this.GetCaster(), ability: this, UnitName: this.upgradeToUnit })


    }
}
