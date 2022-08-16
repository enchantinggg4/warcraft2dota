import { BaseModifier, registerModifier } from "../../lib/dota_ts_adapter";
import { Resource, ResourceHarvester } from "../../types/GoldMine";
import { Abilities } from "../../util/Abilities";
import { DistanceTo, DistanceToVec, log, Utility } from "../../util/Utility";


@registerModifier()
export class modifier_harvest_tree_active extends BaseModifier {

    // Here we ened to make orders to harvest tree and find our base/intermediate building

    private parent!: ResourceHarvester
    private anchor!: Vector

    OnCreated(params: { x: number, y: number, z: number }): void {
        if (IsServer()) {
            this.GetParent();
            this.parent = this.GetParent() as ResourceHarvester;

            this.anchor = Vector(+params.x, +params.y, +params.z);
            if (this.parent.payload)
                this.DepositResources();
            else
                this.HarvestTree();
        }
    }

    DeclareFunctions() {
        return [
            ModifierFunction.ON_ORDER,
            ModifierFunction.ON_ABILITY_FULLY_CAST
        ]
    }


    OnOrder(order: ModifierUnitEvent) {
        if (!Utility.IsMyOrder(this, order)) return;
        this.Destroy();
    }


    OnAbilityFullyCast(event: ModifierAbilityEvent) {
        if (event.ability.GetName() == Abilities.WorkerHarvestLumber) {
            if (!this.parent.payload) {
                this.HarvestTree();
            } else {
                //  find deposit and do stuff
                this.DepositResources();
            }
        } else if (event.ability.GetName() == Abilities.WorkerDepositPayload) {
            if (this.parent.payload) {
                // keep depositing
                this.DepositResources();
            } else {
                this.HarvestTree();
            }
        }
    }

    private DepositResources() {
        const deposit = Utility.FindClosestDeposit(this.parent, Resource.LUMBER);
        if (!deposit) {
            log("No deposit!")
            return
        };

        const ability = this.parent.FindAbilityByName(Abilities.WorkerDepositPayload);
        if (!ability) {
            print("Worker doesnt have ability!!!")
            return;
        }
        this.parent.CastAbilityOnTarget(
            deposit,
            ability,
            this.parent.GetMainControllingPlayer() as PlayerID
        )
    }

    private HarvestTree() {
        if (this.parent.payload) return;

        const myTree = this.FindAnchoredTree();
        if (!myTree) {
            print('No tree, destroying myself...');
            this.Destroy();
        }


        const ability = this.parent.FindAbilityByName(Abilities.WorkerHarvestLumber);
        if (!ability) {
            print("Worker doesnt have ability!!!")
            return;
        }

        this.parent.CastAbilityOnTarget(
            myTree as any,
            ability,
            this.parent.GetMainControllingPlayer() as PlayerID
        )
    }


    private FindAnchoredTree() {
        const trees = GridNav.GetAllTreesAroundPoint(this.anchor, 1000, false);
        // todo: we cant hit 1 tree with more than 1 worker
        return trees.sort((a, b) => DistanceToVec(a, this.anchor) - DistanceToVec(b, this.anchor))[0];
    }
}