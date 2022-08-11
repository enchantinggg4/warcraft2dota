import { BaseModifier, registerModifier } from "../../lib/dota_ts_adapter";
import { Utility } from "../../Utility";
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
        this.lastOrder = order.order_type
    }

    OnUnitMoved(){
        this.timeWithoutMoving = 0;
    }    

    OnIntervalThink(): void {
        if(this.lastOrder == UnitOrder.MOVE_TO_TARGET){
            this.timeWithoutMoving += this.interval;
            
            if(this.timeWithoutMoving >= modifier_acolyte.timeForAction){
                if(this.OnArrivedToTarget()) this.lastOrder = UnitOrder.BUYBACK;
                this.timeWithoutMoving = 0;
            }
        }

        
    }


    private OnArrivedToTarget(): boolean {

        // We need to find closest building to us

        const closestBuilding = Utility.FindClosestBuilding(this.GetParent().GetAbsOrigin(), this.GetParent().GetTeam(), 200);

        if(!closestBuilding) return true;

        if(closestBuilding.HasModifier(modifier_gold_mine_haunted.name)){
            this.GetParent().AddNewModifier(this.GetParent(), undefined, modifier_acolyte_mining.name, { duration: -1})
        }

        return true;
    }

}