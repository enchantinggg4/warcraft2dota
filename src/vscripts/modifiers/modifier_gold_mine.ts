import { BaseModifier, registerModifier } from "../lib/dota_ts_adapter";
import { GoldMine } from "../types/GoldMine";
import { modifier_generic_building } from "./building/modifier_generic_building";

@registerModifier()
export class modifier_gold_mine extends modifier_generic_building {
    
    // Run when modifier instance is created
    OnCreated(params: any): void {
        if (IsServer()) {
            this.StartIntervalThink(1);
        }
        
    }


    GetTexture = () => "acolyte"

    IsHidden(): boolean {
        return false
    }
    
    IsDebuff(): boolean {
        return false;
    }
    

    // Called when intervalThink is triggered
    OnIntervalThink(): void {

        // TODO: eh?
        this.SetStackCount((this.GetParent() as GoldMine).gold);
    }
}
