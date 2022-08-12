import { BaseModifier, registerModifier } from "../../lib/dota_ts_adapter";
import { HauntedGoldMine, IsHauntedGoldMine } from "../../types/GoldMine";
import { Utility } from "../../util/Utility";
import { modifier_generic_build_timer } from "../building/modifier_generic_build_timer";
import { modifier_gold_mine_haunted } from "../modifier_gold_mine_haunted";
import { modifier_acolyte_mining } from "./modifier_acolyte_mining";

@registerModifier()
export class modifier_acolyte extends BaseModifier {

    private lastOrder: UnitOrder = UnitOrder.BUYBACK;

    private interval: number = 0.1;

    private timeWithoutMoving: number = 0;


    static timeForAction: number = 0.5;

    // Run when modifier instance is created
    OnCreated(params: { mineEntityId: number }): void {
        if (IsServer()) {
            this.StartIntervalThink(this.interval);
        }    
    }


    DeclareFunctions(){
        return [
            ModifierFunction.ON_ORDER,
            ModifierFunction.ON_UNIT_MOVED
        ]
    }

    OnOrder(order: ModifierUnitEvent){
        if(!Utility.IsMyOrder(this, order)) return;
        this.lastOrder = order.order_type
    }

    OnUnitMoved(order: ModifierUnitEvent){
        if(!Utility.IsMyOrder(this, order)) return;
        this.timeWithoutMoving = 0;
    }    

    OnIntervalThink(): void {
        if(this.lastOrder == UnitOrder.MOVE_TO_TARGET){
            this.timeWithoutMoving += this.interval;
            
            if(this.timeWithoutMoving >= modifier_acolyte.timeForAction){
                this.OnArrivedToTarget();                
                this.lastOrder = UnitOrder.BUYBACK;
                this.timeWithoutMoving = 0;
            }
        }

        
    }


    private OnArrivedToTarget() {

        // We need to find closest building to us

        const closestBuilding = Utility.FindClosestBuilding(this.GetParent().GetAbsOrigin(), this.GetParent().GetTeam(), 200);

        if(!closestBuilding) return;

        // If its building we dont care
        if(closestBuilding.HasModifier(modifier_generic_build_timer.name)) return;

        if(!IsHauntedGoldMine(closestBuilding)) return;

        if(closestBuilding.HasModifier(modifier_gold_mine_haunted.name)){
            this.AttachToMine(closestBuilding)
        }
    }



    private AttachToMine(mine: HauntedGoldMine){

        const workers = mine.workerList.filter(it => !!it).length;

        if(workers >= 5) return; // no room
        this.GetParent().AddNewModifier(this.GetParent(), undefined, modifier_acolyte_mining.name, { duration: -1, mineEntityId: +mine.GetEntityIndex()});
    }

}