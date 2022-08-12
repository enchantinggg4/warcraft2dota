declare interface EventKeys {
    caster: CBaseEntity;
    ability: CDOTABaseAbility;
    OnPreConstruction(callback: (vPos: Vector) => void): void;
    OnBuildingPosChosen(callback: (vPos: Vector) => void): void;
    OnConstructionFailed(callback: () => void): void;
    OnConstructionCancelled(callback: () => void): void;
    OnConstructionStarted(callback: (unit: unknown) => void): void;
    OnConstructionCompleted(callback: (unit: unknown) => void): void;
    OnBelowHalfHealth(callback: (unit: unknown) => void): void;
    OnAboveHalfHealth(callback: (unit: unknown) => void): void;   
}

declare interface BuildingHelper {

    PlaceBuilding(player: unknown, name: unknown, location: unknown, construction_size: unknown, pathing_size: unknown, angle: unknown): void

    AddBuilding(keys: Partial<EventKeys>): keys is EventKeys;


    InitializeBuilder(npc: CDOTA_BaseNPC): void
}

declare const BuildingHelper: BuildingHelper;