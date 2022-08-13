import { BuildInfo } from "./abilities/builder/generic_build_ability";
import { Resource } from "./types/GoldMine";

export class ResourceManager {

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