import { BaseAbility } from "../lib/dota_ts_adapter";
import { Cost } from "../Money";
import { IUnitTrain } from "./IUnitTrain";

export abstract class generic_unit_train extends BaseAbility {

    abstract unit_name: string;

    abstract modifier_name: string;


    OnSpellStart() {
        const caster = this.GetCaster();

        const playerId = caster.GetMainControllingPlayer() as PlayerID;

        const gold = PlayerResource.GetGold(playerId);

        const { gold: gold_cost, lumber: lumber_cost } = this.GetTrainCost();

        if(gold < gold_cost) return;


        PlayerResource.SetGold(playerId, gold - gold_cost, false);
        

        if (caster.HasModifier(this.modifier_name))
            caster.SetModifierStackCount(this.modifier_name, caster, caster.GetModifierStackCount(this.modifier_name, caster) + 1);
        else
            this.GetCaster().AddNewModifier(caster, this, this.modifier_name, this.GetModifierParams());
    }


    private GetModifierParams(): IUnitTrain {
        return { duration: this.GetSpecialValueFor("train_duration"), unit_name: this.unit_name }
    }

    private GetTrainCost(): Cost {
        return {
            gold: this.GetSpecialValueFor("train_cost_gold"),
            lumber: this.GetSpecialValueFor("train_cost_lumber"),
        }        
    }
}
