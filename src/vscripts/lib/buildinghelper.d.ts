declare interface EventKeys {
    caster: CBaseEntity;
    ability: CDOTABaseAbility;
    OnPreConstruction(callback: (vPos: Vector) => void): void;
    OnBuildingPosChosen(callback: (vPos: Vector) => void): void;
    OnConstructionFailed(callback: () => void): void;
    OnConstructionCancelled(callback: (work: any) => void): void;
    OnConstructionStarted(callback: (unit: CDOTA_BaseNPC) => void): void;
    OnConstructionCompleted(callback: (unit: CDOTA_BaseNPC) => void): void;
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
}

declare const BuildingHelper: BuildingHelper;