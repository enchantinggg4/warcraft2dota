import { BaseAbility, registerAbility } from "../../lib/dota_ts_adapter";
import { modifier_gold_deposit } from "../../modifiers/building/modifer_gold_deposit";
import { modifier_lumber_deposit } from "../../modifiers/building/modifier_lumber_deposit";
import { ResourceManager } from "../../ResourceManager";
import { Resource, ResourceHarvester } from "../../types/GoldMine";

@registerAbility()
export class worker_deposit_payload extends BaseAbility {

    counter = 0;


    OnSpellStart(): void {
        if(this.counter++ != 2) return;

        const parent = this.GetOwner() as ResourceHarvester;
        const payload = parent.payload;
        if (payload) {
            const target = this.GetCursorTarget()!;
            const modifier = payload.resource === Resource.LUMBER ? modifier_lumber_deposit : modifier_gold_deposit;

            if (target.HasModifier(modifier.name)) {
                ResourceManager.Deposit(target.GetMainControllingPlayer() as PlayerID, payload.resource, payload.amount);
                parent.payload = undefined;
            }
        }

        this.counter = 0;
    }
}