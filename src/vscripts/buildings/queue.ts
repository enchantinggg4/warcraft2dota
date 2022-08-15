import { registerEntityFunction } from "../lib/dota_ts_adapter";
import { ResourceManager } from "../ResourceManager";
import { Building, EnqueueEvt } from "../types/gen";
import { Resource } from "../types/GoldMine";
import { GetNumItemsInInventory, IsInFirstSlot, ReorderItems } from "../util/mitems";
import { EnoughForDoMyPower } from "../util/mplayers";
import { UnitMap } from "../util/UnitMap";
import { HasTrainAbility, IsChanneling, IsNightElf, log, SendErrorMessage } from "../util/Utility";
import { StartUpgrade } from "./upgrades";



export class Queue {
    static Init(building: Building) {
        if (!building.IsUnderConstruction) return;
        const buildingName = building.GetUnitName();
        print(`Init queue for ${buildingName}`)

        if (buildingName == UnitMap.HumanWorkshop) {
            Timers.CreateTimer(2.5, () => {
                if (IsValidEntity(building) && building.IsAlive()) {
                    building.AddNewModifier(building, undefined, "modifier_animation_freeze", {})
                }
            });
        }

        building.QueueTimer = Timers.CreateTimer(() => {
            if (IsValidEntity(building) && building.IsAlive()) {
                if (!building.IsUnderConstruction!()) {
                    this.Think(building)
                }
                return 0.03
            }
        });

        log(building.GetUnitName() + ' i have train ability ' + HasTrainAbility(building))
        if (HasTrainAbility(building)) {
            Timers.CreateTimer(2 / 30, () => {
                log('Train ability timer called')
                const origin = building.GetAbsOrigin()

                // Find vector rowards 0, 0, 0 for initial rally point
                const forwardVec = Vector(0, 0, 0).__sub(origin).Normalized();

                // For the initial rally point, get point away from the building looking towards (0,0,0)
                let position = origin.__add(forwardVec.__mul(250))
                position = GetGroundPosition(position, building);

                // Keep track of this position so that every unit is autospawned there
                building.initial_spawn_position = position
                building.flag_type = "position"
                building.flag = position
            });
        }
    }


    static Remove(building: Building) {
        if (building.QueueTimer) {
            Timers.RemoveTimer(building.QueueTimer);
        }
    }


    static Think(building: Building) {
        const playerID = building.GetMainControllingPlayer() as PlayerID;
        const bChanneling = IsChanneling(building)

        if (!bChanneling) {
            building.SetMana(0);
            building.SetBaseManaRegen(0)
        } else {
            if (building.GetUnitName() == UnitMap.HumanWorkshop) {
                building.RemoveModifierByName("modifier_animation_freeze");
            }
        }


        if (building.HasModifier("modifier_frozen")) {
            if (bChanneling) {
                bChanneling.EndChannel(true)
                return;
            }
        }


        if (!bChanneling && !building.IsUnderConstruction!()) {
            building.queue = []

            // Autocast, only if the queue is empty and there's enough food and resources for any of the training
            const nQueued = GetNumItemsInInventory(building)
            if (nQueued == 0) {
                for (let i = 0; i < 15; i++) {
                    const ability = building.GetAbilityByIndex(i)
                    if (ability && ability.GetAutoCastState() && EnoughForDoMyPower(playerID, ability)) {
                        building.CastAbilityNoTarget(ability, playerID);
                    }
                }
            }

            // Check the first item that contains "train" on the queue
            for (let itemSlot = 0; itemSlot < 6; itemSlot++) {
                const item = building.GetItemInSlot(itemSlot);
                if (item && IsValidEntity(item)) {
                    log("Push in think() " + building.queue.length);
                    building.queue.push(item.GetEntityIndex());
                    const itemName = item.GetAbilityName();

                    // Items that contain "train" "revive" or "research" will start a channel of an ability with the same name without the item_ affix
                    if (itemName.includes("train_") || itemName.includes("_revive") || itemName.includes("research_")) {
                        const trainAbilityName = itemName.replaceAll("item_", "");
                        const abilityToChannel = building.FindAbilityByName(trainAbilityName);
                        if (abilityToChannel) {
                            const foodCost = abilityToChannel.GetLevelSpecialValueFor("food_cost", abilityToChannel.GetLevel() - 1) || 0;

                            if (ResourceManager.HasEnoughFood(playerID, foodCost)) {
                                // Add to the value of food used as soon as the unit training starts
                                ResourceManager.ModifyFoodUsed(playerID, foodCost)

                                // Fake mana channel bar
                                abilityToChannel.SetChanneling(true);
                                building.SetMana(0);
                                building.SetBaseManaRegen(building.GetMaxMana() / abilityToChannel.GetChannelTime());

                                // After the channeling time, check if it was cancelled or spawn it
                                // EndChannel(false) runs whatever is in the OnChannelSucceded of the function
                                const time = abilityToChannel.GetChannelTime()
                                Timers.CreateTimer(time, () => {
                                    if (IsValidEntity(building) && building.IsAlive() && IsValidEntity(item)) {
                                        abilityToChannel.EndChannel(false);
                                        ReorderItems(building)
                                    }

                                });
                            }
                        }

                        // Don't continue, queue should strictly only take the first in line
                        return;
                    }
                }
            }
        }

        // Night Elf buildings disable attack
        if (IsNightElf(building) && building.original_attack) {
            building.SetAttackCapability(building.original_attack)
        }
    }
}





// Creates an item on the buildings inventory to consume the queue.
export function EnqueueUnit(this: void, evt: EnqueueEvt & { Action?: "StartUpgrade"}) {
    const { caster, ability, Action } = evt;

    if(caster.queue?.length == 6){
        // Do nothing, we already full
        return;
    }

    const playerID = caster.GetMainControllingPlayer() as PlayerID;
    const goldCost = ability.GetLevelSpecialValueFor("gold_cost", ability.GetLevel() - 1);
    const lumberCost = ability.GetLevelSpecialValueFor("lumber_cost", ability.GetLevel() - 1);

    // Init q
    if (!caster.queue) {
        caster.queue = []
    }


    log(`Trainbuilding ${caster.GetUnitName()} has ${caster.queue.length} queue items`)

    // Check food
    let foodCost = ability.GetLevelSpecialValueFor("food_cost", ability.GetLevel() - 1) || 0;

    // Send need more supply warning
    if (!ResourceManager.HasEnoughFood(playerID, foodCost)) {
        print('No food');
        // const race = 
        // todo
        return
    }

    // if no lumber
    if (!ResourceManager.HasEnoughLumber(playerID, lumberCost)) {
        // refund
        // ResourceManager.Deposit(playerID, Resource.GOLD, goldCost);
        SendErrorMessage(playerID, "#error_not_enough_lumber")
        return;
    } else {
        ResourceManager.ModifyResources(playerID, 0, -lumberCost);
        ResourceManager.ModifyResources(playerID, -goldCost, 0);
    }

    // Queue up to 6 units max
    if (caster.queue?.length < 6) {
        const abilityName = ability.GetAbilityName();
        const itemName = `item_${abilityName}`;
        const player = PlayerResource.GetPlayer(playerID);
        const item = CreateItem(itemName, player, player)!;
        caster.AddItem(item);

        caster.queue = [];


        // RemakeQueue
        for (let itemSlot = 0; itemSlot < 6; itemSlot++) {
            const item = caster.GetItemInSlot(itemSlot)
            if (item) {
                log("Push in enqueue() " + caster.queue.length);
                caster.queue!.push(item.GetEntityIndex());
            }
        }

        // Disable research
        if (abilityName.includes("research_")) {
            // todo
            // DisableResearch(event)
        }

        // Night elf building disable attack
        if (IsNightElf(caster)) {
            caster.original_attack = caster.GetAttackCapability();
            caster.SetAttackCapability(UnitAttackCapability.NO_ATTACK);
        }

        // TODO:
        if(Action == "StartUpgrade"){
            StartUpgrade(evt);
        }


    } else {
        // Refund with message
        ResourceManager.Deposit(playerID, Resource.GOLD, goldCost);
        ResourceManager.Deposit(playerID, Resource.LUMBER, lumberCost)
        SendErrorMessage(playerID, "#error_queue_full");
    }
}


function DequeueUnit(this: void, { caster, ability: itemAbility }: EnqueueEvt) {
    const playerId = caster.GetMainControllingPlayer() as PlayerID;
    const itemAbilityName = itemAbility.GetAbilityName();

    // Get tied ability
    const trainAbilityName = itemAbilityName.replaceAll("item_", "")
    const trainAbility = caster.FindAbilityByName(trainAbilityName)!
    const goldCost = trainAbility.GetLevelSpecialValueFor("gold_cost", trainAbility.GetLevel() - 1);
    const lumberCost = trainAbility.GetLevelSpecialValueFor("lumber_cost", trainAbility.GetLevel() - 1) || 0;

    for (let itemSlot = 0; itemSlot < 5; itemSlot++) {
        const item = caster.GetItemInSlot(itemSlot);
        if (item && item == itemAbility) {
            const queueElement = caster.queue!.indexOf(item.GetEntityIndex());
            caster.queue?.splice(queueElement, 1);

            // Refund cost
            ResourceManager.ModifyResources(playerId, goldCost, lumberCost);

            // Set not channeling if the cancelled item was the first slot
            if (itemSlot == 0 || IsInFirstSlot(caster, item)) {
                // Refund food used
                const ability = caster.FindAbilityByName(trainAbilityName)!
                const foodCost = ability.GetLevelSpecialValueFor("food_cost", ability.GetLevel());
                if (foodCost && !caster.IsUnderConstruction!() && ability.IsChanneling()) {
                    ResourceManager.ModifyFoodUsed(playerId, -foodCost)
                }

                trainAbility.SetChanneling(true)
                trainAbility.EndChannel(true);

                // Fake mana channel bar
                caster.SetMana(0)
                caster.SetBaseManaRegen(0);


                if (caster.GetUnitName() == UnitMap.HumanWorkshop && !caster.HasModifier("modifier_animation_freeze")) {
                    caster.AddNewModifier(caster, undefined, "modifier_animation_freeze", {});
                }
            }

            item.RemoveSelf();
            ReorderItems(caster);
            break;
        }
    }

}


export function NextQueue(this: void, { caster, ability }: EnqueueEvt) {
    ability.SetChanneling(false);

    const hAbility = EntIndexToHScript(ability.GetEntityIndex()) as CDOTABaseAbility;

    for (let itemSlot = 0; itemSlot < 6; itemSlot++) {
        const item = caster.GetItemInSlot(itemSlot)
        if (item) {
            const itemName = tostring(item.GetAbilityName());

            const trainAbilityName = itemName.replaceAll("item_", "")
            if (trainAbilityName == hAbility.GetAbilityName()) {
                const trainAbility = caster.FindAbilityByName(trainAbilityName)
                const queueElement = caster.queue!.indexOf(item.GetEntityIndex());
                if (IsValidEntity(item)) {
                    log("Splice in NextQueue() " + caster.queue!.length);
                    caster.queue!.splice(queueElement, 1)
                    caster.RemoveItem(item)
                }

                break
            }
        }
    }

    ReorderItems(caster)

}





// Registers
registerEntityFunction('EnqueueUnit', (evt) => EnqueueUnit(evt));
registerEntityFunction('NextQueue', (evt) => NextQueue(evt));
registerEntityFunction('DequeueUnit', (evt) => DequeueUnit(evt));
