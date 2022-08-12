$.Msg("Rightclick panorama loaded");


function HasModifier(entIndex: EntityIndex, modifierName: string){
    var nBuffs = Entities.GetNumBuffs(entIndex)
    for (var i = 0; i < nBuffs; i++) {
        if (Buffs.GetName(entIndex, Entities.GetBuff(entIndex, i)) == modifierName)
            return true
    };
    return false
}


function GetMouseTarget(): EntityIndex{
    var mouseEntities = GameUI.FindScreenEntities( GameUI.GetCursorPosition() )
    var localHeroIndex = Players.GetPlayerHeroEntityIndex( Players.GetLocalPlayer() )

    for ( var e of mouseEntities )
    {
        if ( !e.accurateCollision )
            continue
        return e.entityIndex
    }

    for ( var e of mouseEntities )
    {
        return e.entityIndex
    }

    return 0 as EntityIndex
}

function OnRightButtonPressed()
{
    var iPlayerID = Players.GetLocalPlayer()
    var selectedEntities = Players.GetSelectedEntities( iPlayerID )
    var mainSelected = Players.GetLocalPlayerPortraitUnit() 
    var mainSelectedName = Entities.GetUnitName( mainSelected )    
    var targetIndex = GetMouseTarget()
    var cursor = GameUI.GetCursorPosition()
    var pressedShift = GameUI.IsShiftDown()
    var bMessageShown = false

    

    // Enemy right click
    // if (targetIndex && Entities.IsEnemy(targetIndex))
    // {
    //     // If it can't be attacked by a unit on the selected group, send them to attack move and show an error (only once)
        
    //     var order = {
    //                 QueueBehavior : OrderQueueBehavior_t.DOTA_ORDER_QUEUE_DEFAULT,
    //                 ShowEffects : true,
    //                 OrderType : dotaunitorder_t.DOTA_UNIT_ORDER_ATTACK_MOVE,
    //                 Position : Entities.GetAbsOrigin( targetIndex ),
    //             }

    //     for (var i = 0; i < selectedEntities.length; i++)
    //     {
    //         if (! UnitCanAttackTarget(selectedEntities[i], targetIndex))
    //         {
    //             order.UnitIndex = selectedEntities[i]
    //             Game.PrepareUnitOrders( order )
    //             if (!bMessageShown)
    //             {
    //                 GameUI.CreateErrorMessage({text : "#error_cant_target_air", style : {color:'#E62020'}, duration : 2})
    //                 bMessageShown = true
    //             }
    //         }
    //     }
    //     if (bMessageShown)
    //     {
    //         return true
    //     }
    // }

    // Unit rightclick
    // if (targetIndex)
    // {
    //     var targetName = Entities.GetUnitName(targetIndex)
    //     var bOwnTarget = Entities.IsControllableByPlayer(targetIndex, iPlayerID)
    //     var bOrganicSelected = !IsCustomBuilding(mainSelected) && !IsMechanical(mainSelected) && !IsWard(mainSelected)

    //     // on moonwell
    //     if (targetName == "nightelf_moon_well" && bOrganicSelected && bOwnTarget && Entities.GetHealthPercent(mainSelected) < 100)
    //     {
    //         $.Msg("Unit "+mainSelectedName+" clicked on moon well to replenish")
    //         GameEvents.SendCustomGameEventToServer("moonwell_order", {well: targetIndex, targetIndex: mainSelected})
    //         return Entities.GetRangeToUnit(mainSelected, targetIndex) <= 500 //Move to target if not in range
    //     }
    //     // archer on hippogryph
    //     else if (mainSelectedName == "nightelf_archer" && targetName == "nightelf_hippogryph" && bOwnTarget)
    //     {
    //         $.Msg("Archer clicked on a hippogryph")
    //         GameEvents.SendCustomGameEventToServer("hippogryph_ride_order", {archer: mainSelected, hippo: targetIndex})
    //     }
    //     // hippogryph on archer
    //     else if (mainSelectedName == "nightelf_hippogryph" && targetName == "nightelf_archer" && bOwnTarget)
    //     {
    //         $.Msg("Hippogryph clicked on an archer")
    //         GameEvents.SendCustomGameEventToServer("hippogryph_ride_order", {archer: targetIndex, hippo: mainSelected})
    //     }
    // }
    // // Tree click
    
    // else 
    if (HasModifier(mainSelected, "modifier_harvest_tree"))
    {
        GameEvents.SendCustomGameEventToServer<any>("right_click_order", {
            position: Game.ScreenXYToWorld(cursor[0], cursor[1]),
            selected: selectedEntities.map(it => +it)
        })
    }

    // // Builder Right Click
    // if (IsBuilder(mainSelected))
    // {
    //     // Cancel BH
    //     if (!pressedShift) SendCancelCommand()

    //     if (targetIndex)
    //     {
    //         // on a gold mine
    //         if (targetName == "gold_mine"){

    //             // uprooted night elf tree
    //             if (mainSelectedName.indexOf("nightelf_tree_of_") != -1 && Entities.HasModifier(mainSelected, "modifier_uprooted") && !Abilities.IsHidden(Entities.GetAbilityByName(mainSelected, "nightelf_entangle_gold_mine")))
    //                 GameEvents.SendCustomGameEventToServer("entangle_order", {tree: mainSelected, targetIndex: targetIndex, queue: pressedShift})
    //             else
    //                 GameEvents.SendCustomGameEventToServer("gold_gather_order", {mainSelected: mainSelected, targetIndex: targetIndex, queue: pressedShift})
                    
    //             return true
    //         }
    //         // wisp on a entangled gold mine
    //         else if (mainSelectedName == "nightelf_wisp" && targetName == "nightelf_entangled_gold_mine" && bOwnTarget){
    //             GameEvents.SendCustomGameEventToServer("gold_gather_order", {mainSelected: mainSelected, targetIndex: targetIndex, queue: pressedShift})
    //             return true
    //         }
    //         // acolyte on a haunted gold mine
    //         else if (mainSelectedName == "undead_acolyte" && targetName == "undead_haunted_gold_mine" && bOwnTarget){
    //             GameEvents.SendCustomGameEventToServer("gold_gather_order", {mainSelected: mainSelected, targetIndex: targetIndex, queue: pressedShift})
    //             return true
    //         }
    //         // peon on a burrow
    //         else if (mainSelectedName == "orc_peon" && targetName == "orc_burrow" && bOwnTarget){
    //             $.Msg(" Targeted orc burrow")
    //             GameEvents.SendCustomGameEventToServer("burrow_order", {mainSelected: mainSelected, targetIndex: targetIndex})
    //             return true
    //         }
    //         // acolyte on a sacrificial pit that isn't channeling
    //         else if (mainSelectedName == "undead_acolyte" && targetName == "undead_sacrificial_pit" && bOwnTarget && Abilities.GetChannelStartTime(Entities.GetAbilityByName(targetIndex, "undead_train_shade")) == 0) {
    //             $.Msg(" Targeted sacrificial pit")
    //             GameEvents.SendCustomGameEventToServer("sacrifice_order", {pit: targetIndex, targetIndex: mainSelected})
    //         }
    //         // on a building or mechanical unit with health missing
    //         else if (right_click_repair && (IsCustomBuilding(targetIndex) || IsMechanical(targetIndex)) && Entities.GetHealthPercent(targetIndex) < 100 && IsAlliedUnit(targetIndex)) {
    //             GameEvents.SendCustomGameEventToServer("building_helper_repair_command", {targetIndex: targetIndex, queue: pressedShift})
    //             return true
    //         }
    //     }
    // }

    // // Building Right Click
    // else if (IsCustomBuilding(mainSelected))
    // {
    //     $.Msg("Building Right Click")
    //     if (targetIndex)
    //     {
    //         // on a gold mine, entangled or haunted
    //         if (targetName == "gold_mine" || (bOwnTarget && (targetName == "nightelf_entangled_gold_mine" || targetName == "undead_haunted_gold_mine")))
    //         {
    //             $.Msg(" Targeted gold mine (rally)")
    //             GameEvents.SendCustomGameEventToServer("building_rally_order", {mainSelected: mainSelected, rally_type: "mine", targetIndex: targetIndex})
    //         }
    //         // shop on a unit with inventory
    //         else if (IsShop( mainSelected ) && bOwnTarget  && (Entities.IsHero( targetIndex ) || Entities.IsInventoryEnabled( targetIndex )) && Entities.GetRangeToUnit(mainSelected, targetIndex) <= 900)
    //         {
    //             $.Msg(" Shop targeted unit with inventory")
    //             GameEvents.SendCustomGameEventToServer("shop_active_order", {shop: mainSelected, unit: targetIndex, targeted: true})
    //         }
    //         // gold mine on a wisp
    //         else if (mainSelectedName == "nightelf_entangled_gold_mine" && targetName == "nightelf_wisp" && bOwnTarget)
    //         {
    //             $.Msg(" Entangled gold mine loading wisp")
    //             GameEvents.SendCustomGameEventToServer("gold_gather_order", {mainSelected: targetIndex, targetIndex: mainSelected, queue: pressedShift})
    //             return false
    //         }
    //         // moonwell on a unit
    //         else if (mainSelectedName == "nightelf_moon_well" && bOwnTarget && !IsCustomBuilding(targetIndex) && !IsMechanical(targetIndex) && Entities.GetHealthPercent(targetIndex) < 100)
    //         {
    //             $.Msg(" Moon Well targeted a unit to replenish")
    //             GameEvents.SendCustomGameEventToServer("moonwell_order", {well: mainSelected, targetIndex: targetIndex})
    //         }
    //         // sacrificial pit on an acolyte 
    //         else if (mainSelectedName == "undead_sacrificial_pit" && targetName == "undead_acolyte" && bOwnTarget){
    //             $.Msg(" Sacrificial Pit targeted acolyte to sacrifice")
    //             //Avoid action if currently channeling, as it would stop the process
    //             var channeling = Abilities.GetChannelStartTime(Entities.GetAbilityByName(mainSelected, "undead_train_shade")) > 0
    //             if (!channeling)
    //             {
    //                 GameEvents.SendCustomGameEventToServer("sacrifice_order", {pit: mainSelected, targetIndex: targetIndex})
    //                 return false
    //             }
    //             else
    //                 GameUI.CreateErrorMessage({message:"error_already_sacrificing"})
    //         }
    //         // on an allied unit
    //         else if (IsAlliedUnit(targetIndex))
    //         {
    //             $.Msg(" Targeted some entity (rally)")
    //             GameEvents.SendCustomGameEventToServer("building_rally_order", {mainSelected: mainSelected, rally_type: "target", targetIndex: targetIndex})
    //         }
    //         else if (!Entities.HasAttackCapability(DOTAUnitAttackCapability_t.DOTA_UNIT_CAP_NO_ATTACK))
    //         {
    //             return false // Keep the attack order
    //         }
    //         return true
    //     }
    //     // on a position
    //     else
    //     {
    //         $.Msg(" Targeted position (rally)")
    //         var GamePos = Game.ScreenXYToWorld(cursor[0], cursor[1])
    //         GameEvents.SendCustomGameEventToServer("building_rally_order", {mainSelected: mainSelected, rally_type: "position", position: GamePos})
    //         return true
    //     }
    // }

    return false
}

// Main mouse event callback
GameUI.SetMouseCallback(function(eventName, arg) {
    var CONSUME_EVENT = true
    var CONTINUE_PROCESSING_EVENT = false
    var LEFT_CLICK = (arg === 0)
    var RIGHT_CLICK = (arg === 1)


    if ( GameUI.GetClickBehaviors() !== CLICK_BEHAVIORS.DOTA_CLICK_BEHAVIOR_NONE )
        return CONTINUE_PROCESSING_EVENT

    var mainSelected = Players.GetLocalPlayerPortraitUnit()

    if (eventName === "pressed" || eventName === "doublepressed")
    {
        if (RIGHT_CLICK) 
            return OnRightButtonPressed() 
        // Builder Clicks
        // if (IsBuilder(mainSelected))
        //     if (LEFT_CLICK) 
        //         return (state == "active") ? SendBuildCommand() : OnLeftButtonPressed()
        //     else if (RIGHT_CLICK) 
        //         return OnRightButtonPressed()

        // if (LEFT_CLICK) 
        //     return OnLeftButtonPressed()
        // else if (RIGHT_CLICK) 
        //     return OnRightButtonPressed() 
        
    }

    // if (eventName === "wheeled") {
    //     var value = arg == 1 ? -cameraInterval : cameraInterval;
    //     ZoomEvent(cameraDistance+value)
    //     return CONSUME_EVENT;
    // }
    return CONTINUE_PROCESSING_EVENT
} )