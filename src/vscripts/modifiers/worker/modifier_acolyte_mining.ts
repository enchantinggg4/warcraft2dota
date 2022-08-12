import { BaseModifier, registerModifier } from "../../lib/dota_ts_adapter";
import { HauntedGoldMine, IsHauntedGoldMine } from "../../types/GoldMine";
import { Utility } from "../../util/Utility";

@registerModifier()
export class modifier_acolyte_mining extends BaseModifier {

    mineEntityId!: EntityIndex;
    mine!: HauntedGoldMine

    // Run when modifier instance is created
    OnCreated(params: { mineEntityId: EntityIndex }): void {
        if (IsServer()) {
            this.mineEntityId = params.mineEntityId
            print("Mine entity id", this.mineEntityId)


            const mine = EntIndexToHScript(this.mineEntityId) as CDOTA_BaseNPC;

            if (IsHauntedGoldMine(mine)) {
                this.mine = mine;
                this.Attach();
            } else {
                this.Destroy();
                return;
            }



            this.StartIntervalThink(1);
        }
    }

    private Attach() {

        const myIndex = Utility.FindFreeSpot(this.mine);
        if (myIndex == undefined) {
            this.Destroy();
            return;
        }

        print(myIndex)

        const rotateAngle = (360 / 5) * myIndex;
        const newPos: Vector = RotatePosition(Vector(0, 0, 0), QAngle(0, rotateAngle, 0), this.mine.GetForwardVector()).__mul(200);

        this.GetParent().SetAbsOrigin(this.mine.GetAbsOrigin().__add(newPos));
        this.GetParent().SetForwardVector(
            this.mine.GetAbsOrigin().__sub(this.GetParent().GetAbsOrigin()).Normalized()
        )
        this.mine.workerList[myIndex] = this.GetParent();

        
    }


    DeclareFunctions() {
        return [
            ModifierFunction.OVERRIDE_ANIMATION,
            ModifierFunction.ON_ORDER,
        ]
    }


    OnOrder(order: ModifierUnitEvent) {
        if (!Utility.IsMyOrder(this, order)) return;

        if (this.mine) {
            const myIndex = this.mine.workerList.indexOf(this.GetParent());
            if (myIndex != -1)
                this.mine.workerList[myIndex] = undefined;
        }


        this.Destroy();
    }

    GetOverrideAnimation() {
        return GameActivity.DOTA_FLAIL
    }

    OnIntervalThink(): void {
        const acolyte = this.GetParent();
        const playerId = acolyte.GetMainControllingPlayer() as PlayerID;

        PlayerResource.SetGold(playerId, PlayerResource.GetGold(playerId) + 10, false); // todo extract +10
    }

}