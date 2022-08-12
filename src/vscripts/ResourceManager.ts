import { Resource } from "./types/GoldMine";

export class ResourceManager {

    public static Deposit(playerId: PlayerID, resource: Resource, amount: number){
        if(resource === Resource.GOLD){
            PlayerResource.SetGold(
                playerId,
                PlayerResource.GetGold(playerId) + amount,
                false
            );
        }else {
            PlayerResource.SetLumber(
                playerId,
                PlayerResource.GetLumber(playerId) + amount
            );
        }
    }
}