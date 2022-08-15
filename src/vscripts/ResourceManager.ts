import { BuildInfo } from "./abilities/builder/generic_build_ability";
import { Resource } from "./types/GoldMine";

export class ResourceManager {

    public static GetGold(playerId: PlayerID): number {
        return PlayerResource.GetGold(playerId)
    }

    public static GetLumber(playerId: PlayerID): number {
        return PlayerResource.GetLumber(playerId)
    }

    public static GetFoodLimit(playerId: PlayerID): number {
        // tODO
        return 100;
        // return PlayerResource.GetLumber(playerId)
    }

    public static GetFoodUsed(playerId: PlayerID): number {
        // tODO
        return 10;
        // return PlayerResource.GetLumber(playerId)
    }

    public static HasEnoughFood(playerId: PlayerID, foodCost: number){
        // todo
        return true;
    }

    public static ModifyFoodUsed(playerId: PlayerID, foodCost: number){
        // todo
        return;
    }

    public static HasEnoughLumber(playerId: PlayerID, lumber: number): boolean { 
        print(lumber)
        print(this.GetLumber(playerId))
        print(')')
        return this.GetLumber(playerId) >= lumber
    }


    public static Deposit(playerId: PlayerID, resource: Resource, amount: number) {
        if (resource === Resource.GOLD) {
            this.ModifyResources(playerId, amount, 0);
        } else {
            this.ModifyResources(playerId, 0, amount);
        }
    }

    public static ModifyResources(playerId: PlayerID, gold: number, lumber: number) {
        if (gold != 0) {
            PlayerResource.SetGold(
                playerId,
                PlayerResource.GetGold(playerId) + gold,
                false
            );
            // todo: event
        }
        if (lumber != 0) {
            const newLumber = PlayerResource.GetLumber(playerId) + lumber;
            PlayerResource.SetLumber(
                playerId,
                newLumber
            );

            this.OnLumberChanged(playerId, newLumber)
        }
    }


    public static HasEnoughResources(playerID: PlayerID, info: BuildInfo): boolean {
        return PlayerResource.GetGold(playerID) >= info.gold && PlayerResource.GetLumber(playerID) >= info.lumber;
    }


    private static OnLumberChanged(pid: PlayerID, lumber: number) {
        CustomGameEventManager.Send_ServerToPlayer<any>(PlayerResource.GetPlayer(pid)!, "lumber_changed", {
            lumber
        });
    }
}