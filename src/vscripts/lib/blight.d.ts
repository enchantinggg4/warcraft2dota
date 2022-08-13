declare interface Blight {
    Create(unit: any, size: 'large' | 'small' | 'tiny'): void
    Remove(unit: any): void;
    Dispel(location: Vector): void;
    CreateDummy(position: Vector): void;
    GridHasParticle(x: number, y: number): boolean;
}


declare interface BuildingHelper {
    GridHasBlight(x: number, y: number): boolean;
    PositionHasBlight(position: Vector): boolean;
}

declare const Blight: Blight;