import { BaseModifier, registerModifier } from "../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_fake_invul extends BaseModifier {

    // Run when modifier instance is created
    OnCreated(): void {
        
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.ON_TAKEDAMAGE
        ]
    }

    OnTakeDamage(event: ModifierAttackEvent & { unit: CDOTA_BaseNPC }): void {
        if (IsServer() && event.unit === this.GetParent()) {
            event.unit.SetHealth(event.unit.GetHealth() + event.damage);
        }
    }

}