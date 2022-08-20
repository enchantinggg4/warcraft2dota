declare interface EventKeys {
    caster: CBaseEntity;
    ability: CDOTABaseAbility;
    OnPreConstruction(callback: (this: void, vPos: Vector) => void): void;
    OnBuildingPosChosen(callback: (this: void, vPos: Vector) => void): void;
    OnConstructionFailed(callback: (this: void, ) => void): void;
    OnConstructionCancelled(callback: (this: void, work: any) => void): void;
    OnConstructionStarted(callback: (this: void, unit: CDOTA_BaseNPC) => void): void;
    OnConstructionCompleted(callback: (this: void, unit: CDOTA_BaseNPC) => void): void;
    OnBelowHalfHealth(callback: (unit: unknown) => void): void;
    OnAboveHalfHealth(callback: (unit: unknown) => void): void;   
}

declare interface BuildingHelper {

    PlaceBuilding(player: CDOTAPlayerController, name: string, location: Vector, construction_size: number, pathing_size: number, angle: number): CDOTA_BaseNPC

    AddBuilding(keys: Partial<EventKeys>): keys is EventKeys;


    InitializeBuilder(npc: CDOTA_BaseNPC): void

    GetConstructionSize(npc: CDOTA_BaseNPC | string): number;

    GetBlockPathingSize(npc: string): number

    GetPlayerTable(playerId: PlayerID): any

    SendGNV(args: { PlayerID: PlayerID}): void;


    UpgradeBuilding<T = CDOTA_BaseNPC>(building: CDOTA_BaseNPC, newUnitName: string): T
}

declare const BuildingHelper: BuildingHelper;