import { BaseModifier, registerModifier } from "../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_acolyte_mining extends BaseModifier {

    mineEntityId!: number;

    // Run when modifier instance is created
    OnCreated(params: { mineEntityId: number }): void {
        if (IsServer()) {
            this.StartIntervalThink(1);
            this.mineEntityId = params.mineEntityId
        }    
    }


    DeclareFunctions(){
        return [
            ModifierFunction.OVERRIDE_ANIMATION,
            ModifierFunction.ON_ORDER,
        ]
    }


    OnOrder(order: ModifierUnitEvent){
        this.Destroy();
    }

    GetOverrideAnimation(){
        return GameActivity.DOTA_FLAIL
    }

    OnIntervalThink(): void {
        const acolyte = this.GetParent();
        const playerId = acolyte.GetMainControllingPlayer() as PlayerID;
        
        PlayerResource.SetGold(playerId, PlayerResource.GetGold(playerId) + 10, false); // todo extract +10
    }

}