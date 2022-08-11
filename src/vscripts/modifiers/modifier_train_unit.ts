import { IUnitTrain } from "../abilities/IUnitTrain";
import { BaseModifier, registerModifier } from "../lib/dota_ts_adapter";


export abstract class modifier_train_unit extends BaseModifier {
    
    unit_name: string = ""
    train_duration: number = 1;

    abstract modifier_texture: string;


    // Run when modifier instance is created
    OnCreated(params: IUnitTrain): void {
        if (IsServer()) {
            this.StartIntervalThink(0.1);
            this.unit_name = params.unit_name;
            this.train_duration = params.duration;
        }
        
    }


    GetTexture = () => this.modifier_texture

    IsHidden(): boolean {
        return false
    }
    
    IsDebuff(): boolean {
        return false;
    }
    

    // Called when intervalThink is triggered
    OnIntervalThink(): void {
        if(this.GetRemainingTime() <= 0){
            if(this.GetStackCount() == 0){
                this.Spawn();
                this.Destroy();
            }
            else {
                this.Spawn();
                this.SetStackCount(this.GetStackCount() - 1);
                this.SetDuration(this.train_duration, true);
            }
        }
    }

    DestroyOnExpire(): boolean {
        return false;
    }


    private Spawn(){
        if (!IsServer()) return;
        const playerOwnerId = this.GetParent().GetMainControllingPlayer() as PlayerID;
        const player = PlayerResource.GetPlayer(playerOwnerId)!;
        const position = this.GetParent().GetAbsOrigin().__add(this.GetParent().GetForwardVector().__mul(200));
        const acolyte: CDOTA_BaseNPC = CreateUnitByName(this.unit_name, position, true, player, player, player.GetTeam());
        acolyte.SetControllableByPlayer(playerOwnerId, true);    
    }
}
