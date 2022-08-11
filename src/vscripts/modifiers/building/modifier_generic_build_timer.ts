import { BaseModifier, registerModifier } from "../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_generic_build_timer extends BaseModifier {

    healPerSecond: number = 0;

    interval = 0.5;


    // Make building stunned while it is building so it can't use its abilities
    CheckState(){
        return {
            [ModifierState.STUNNED]: true
        }
    }

    OnCreated(): void {
        if (IsServer()) {
            this.StartIntervalThink(this.interval);

            const parent = this.GetParent();
        
            // Set 10% health at start
            parent.SetHealth(parent.GetMaxHealth() * 0.1);

            const fullTime = this.GetDuration();
            const healthToHeal = parent.GetMaxHealth() * 0.9;

            this.healPerSecond = healthToHeal / fullTime;
        }
    }


    GetTexture(): string {
        return ""
    }

    IsDebuff(): boolean {
        return true;
    }

    IsHidden(): boolean {
        return false;
    }


    OnIntervalThink(): void {
        this.GetParent().Heal(this.interval * this.healPerSecond, undefined);
    }

}