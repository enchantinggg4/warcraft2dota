"use strict"
var right_click_repair = CustomNetTables.GetTableValue("building_settings", "right_click_repair").value;

function HasModifier(entIndex, modifierName) {
    var nBuffs = Entities.GetNumBuffs(entIndex);
    for (var i = 0; i < nBuffs; i++) {
        if (Buffs.GetName(entIndex, Entities.GetBuff(entIndex, i)) == modifierName)
            return true;
    }
    ;
    return false;
}

function GetMouseTarget()
{
    var mouseEntities = GameUI.FindScreenEntities( GameUI.GetCursorPosition() )

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

    return 0
}

// Handle Right Button events
function OnRightButtonPressed()
{
    var iPlayerID = Players.GetLocalPlayer()
    var selectedEntities = Players.GetSelectedEntities( iPlayerID )
    var mainSelected = Players.GetLocalPlayerPortraitUnit() 
    var targetIndex = GetMouseTarget()
    var pressedShift = GameUI.IsShiftDown()
    var cursor = GameUI.GetCursorPosition();

    // Builder Right Click
    if ( IsBuilder( mainSelected ) )
    {
        // Cancel BH
        if (!pressedShift) SendCancelCommand()

        // Repair rightclick
        if (right_click_repair && IsCustomBuilding(targetIndex) && Entities.GetHealthPercent(targetIndex) < 100 && IsAlliedUnit(targetIndex, mainSelected)) {
            GameEvents.SendCustomGameEventToServer( "building_helper_repair_command", {targetIndex: targetIndex, queue: pressedShift})
            return true
        }
    }

    if (HasModifier(mainSelected, "modifier_harvest_tree")) {
        GameEvents.SendCustomGameEventToServer("right_click_order", {
            position: Game.ScreenXYToWorld(cursor[0], cursor[1]),
            selected: selectedEntities.map(it => +it)
        });
    }

    return false
}

// Handle Left Button events
function OnLeftButtonPressed() {
    return false
}

function IsCustomBuilding(entIndex) {
    return (Entities.GetAbilityByName( entIndex, "ability_building") != -1)
}

function IsBuilder(entIndex) {
    var tableValue = CustomNetTables.GetTableValue( "builders", entIndex.toString())
    $.Msg(tableValue)
    return (tableValue !== undefined) && (tableValue.IsBuilder == 1)
}



function IsAlliedUnit(entIndex, targetIndex) {
    return (Entities.GetTeamNumber(entIndex) == Entities.GetTeamNumber(targetIndex))
}

// Main mouse event callback
GameUI.SetMouseCallback( function( eventName, arg ) {
    var CONSUME_EVENT = true
    var CONTINUE_PROCESSING_EVENT = false
    var LEFT_CLICK = (arg === 0)
    var RIGHT_CLICK = (arg === 1)

    if ( GameUI.GetClickBehaviors() !== CLICK_BEHAVIORS.DOTA_CLICK_BEHAVIOR_NONE )
        return CONTINUE_PROCESSING_EVENT

    var mainSelected = Players.GetLocalPlayerPortraitUnit()

    if ( eventName === "pressed" || eventName === "doublepressed")
    {
        // Builder Clicks
        if (IsBuilder(mainSelected))
            if (LEFT_CLICK) 
                return (state == "active") ? SendBuildCommand() : OnLeftButtonPressed()
            else if (RIGHT_CLICK) 
                return OnRightButtonPressed()

        if (LEFT_CLICK) 
            return OnLeftButtonPressed()
        else if (RIGHT_CLICK) 
            return OnRightButtonPressed() 
        
    }
    return CONTINUE_PROCESSING_EVENT
} )