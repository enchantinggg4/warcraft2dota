import { BaseAbility, registerAbility } from "../../lib/dota_ts_adapter";
import { Resource, ResourceHarvester } from "../../types/GoldMine";

@registerAbility()
export class worker_harvest_lumber extends BaseAbility {

    private counter: number = 0;

    static ticksToHarvest = 2;

    static harvestAmount = 10;


    CastFilterResultTarget(target: CDOTA_BaseNPC) {
        const harvester = this.GetOwner() as ResourceHarvester;
        if (harvester.payload) {
            return UnitFilterResult.FAIL_CUSTOM;
        }
        return UnitFilterResult.SUCCESS;
    }

    OnSpellStart(): void {
        this.counter++;
        // todo: replace with actual values

        print(this.counter);

        const tree: CDOTA_MapTree = this.GetCursorTarget()! as unknown as CDOTA_MapTree;

        if (this.counter == worker_harvest_lumber.ticksToHarvest) {
            // we gathered anough
            const harvester = this.GetOwner() as ResourceHarvester
            harvester.payload = {
                resource: Resource.LUMBER,
                amount: worker_harvest_lumber.harvestAmount
            };
            const newHealth = Math.max(0, tree.GetHealth() - worker_harvest_lumber.harvestAmount);

            print(newHealth);
            tree.SetHealth(newHealth);
            if (newHealth <= 0) {
                GridNav.DestroyTreesAroundPoint(tree.GetAbsOrigin(), 20, false);
            }
            this.counter = 0;
        }
    }
}