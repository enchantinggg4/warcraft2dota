import { BaseModifier, registerModifier } from "../lib/dota_ts_adapter";

@registerModifier()
export class modifier_gold_mine_haunted extends BaseModifier {
    
    mineEntityId!: number;
    
    // Run when modifier instance is created
    OnCreated(params: { mineEntityId: number }): void {
        if (IsServer()) {
            this.StartIntervalThink(1);
        }
        this.mineEntityId = params.mineEntityId;
    }


    GetTexture = () => "gold"

    IsHidden(): boolean {
        return true
    }
    
    IsDebuff(): boolean {
        return false;
    }

    GetEffectName(): string {
        return "particles/haunted_mine.vpcf"
    }

    GetEffectAttachType(): ParticleAttachment {
        return ParticleAttachment.POINT_FOLLOW;
    }

    // Called when intervalThink is triggered
    OnIntervalThink(): void {

    }
}
