


export interface Building extends CDOTA_BaseNPC {
    IsUnderConstruction?(): boolean;
    QueueTimer?: string;

    initial_spawn_position?: Vector
    flag_type?: string;
    flag?: Vector | CDOTA_BaseNPC

    queue?: EntityIndex[];

    original_attack?: UnitAttackCapability
}

export interface EnqueueEvt<T = Building> {
    caster: T;
    ability: CDOTABaseAbility;
}