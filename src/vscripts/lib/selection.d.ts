
declare interface CDOTA_PlayerResource {
   
    SetLumber(playerId: PlayerID, newAmount: number): void;
    GetLumber(playerId: PlayerID): number;
}
