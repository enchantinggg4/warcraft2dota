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

    PlaceBuilding(player: unknown, name: unknown, location: unknown, construction_size: unknown, pathing_size: unknown, angle: unknown): void

    AddBuilding(keys: Partial<EventKeys>): keys is EventKeys;


    InitializeBuilder(npc: CDOTA_BaseNPC): void

    GetConstructionSize(npc: CDOTA_BaseNPC | string): number;

    GetPlayerTable(playerId: PlayerID): any

    SendGNV(args: { PlayerID: PlayerID}): void;
}

declare const BuildingHelper: BuildingHelper;