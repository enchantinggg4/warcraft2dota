import { BuildManager } from "./BuildManager";
import { reloadable } from "./lib/tstl-utils";
import { modifier_gold_mine } from "./modifiers/mine/modifier_gold_mine";
import { modifier_fake_invul } from "./modifiers/util/modifier_fake_invul";
import { modifier_acolyte } from "./modifiers/worker/modifier_acolyte";
import { GoldMine, Resource } from "./types/GoldMine";
import { CustomGameEvents } from "./util/CustomGameEvents";
import { Spawns } from "./util/Spawns";
import { log, Utility } from "./util/Utility";
import { InstallLumber } from "./lib/lumber"
import { ResourceManager } from "./ResourceManager";
import { UnitMap } from "./util/UnitMap";
import { Units } from "./util/Units";
import { Queue } from "./buildings/queue";

import "./util/extend_npc"
const heroSelectionTime = 20;

declare global {
    interface CDOTAGameRules {
        Addon: GameMode;
    }
}

@reloadable
export class GameMode {
    public static Precache(this: void, context: CScriptPrecacheContext) {
        PrecacheResource("particle", "particles/units/heroes/hero_meepo/meepo_earthbind_projectile_fx.vpcf", context);
        PrecacheResource("soundfile", "soundevents/game_sounds_heroes/game_sounds_meepo.vsndevts", context);
        PrecacheResource("particle_folder", "particles/buildinghelper", context);
    }

    public static Activate(this: void) {
        // When the addon activates, create a new instance of this GameMode class.
        InstallLumber();
        GameRules.Addon = new GameMode();
    }


    constructor() {
        this.configure();

        // Register event listeners for dota engine events
        ListenToGameEvent("game_rules_state_change", () => this.OnStateChange(), undefined);
        // ListenToGameEvent("dota_player_spawned", event => this.OnPlayerSpawned(event), undefined);
        ListenToGameEvent("npc_spawned", event => this.OnNpcSpawn(event), undefined);


        CustomGameEventManager.RegisterListener<any>("right_click_order", Dynamic_Wrap<any, any>(CustomGameEvents, 'OnRightClick'));
        CustomGameEventManager.RegisterListener<any>("cancel_current_action", (_, data) => {
            print("Cancel action ", data.PlayerID)
            print(data.SelectedEntity);
            const firstUnit = EntIndexToHScript(data.SelectedEntity) as CDOTA_BaseNPC;
            print(firstUnit.GetName());
        });
    }

    private configure(): void {
        GameRules.SetCustomGameTeamMaxPlayers(DotaTeam.GOODGUYS, 3);
        GameRules.SetCustomGameTeamMaxPlayers(DotaTeam.BADGUYS, 3);

        GameRules.SetShowcaseTime(0);
        GameRules.SetHeroSelectionTime(heroSelectionTime);
        GameRules.SetStrategyTime(1);

        GameRules.SetTreeRegrowTime(100000000);

        GameRules.GetGameModeEntity().SetCustomGameForceHero("npc_dota_hero_alchemist");

        // GameRules.GetGameModeEntity().SetUnseenFogOfWarEnabled(true);
    }

    public OnStateChange(): void {
        const state = GameRules.State_Get();

        if (state === GameState.CUSTOM_GAME_SETUP) {
            // Automatically skip setup in tools
            if (IsInToolsMode()) {
                Timers.CreateTimer(1, () => {
                    GameRules.FinishCustomGameSetup();
                });
            }


        }

        // Start game once pregame hits
        if (state === GameState.PRE_GAME) {
            this.LoadMap();
            Timers.CreateTimer(0.2, () => this.StartGame());
        }
    }

    private StartGame(): void {
        print("Game starting!");

        // Do some stuff here
    }

    // Called on script_reload
    public Reload() {
        print("Script reloaded!");




        // Do some stuff here
    }

    private OnNpcSpawn(event: NpcSpawnedEvent) {


        if (!IsServer()) return;
        const npc = EntIndexToHScript(event.entindex) as CDOTA_BaseNPC;

        // Spawns.DoSpawns(npc);
        Units.Init(npc)

        if (npc.HasAbility("train_acolyte")) {
            npc.FindAbilityByName("train_acolyte")?.SetLevel(1);
            return;
        }
        if (!npc.IsRealHero()) return;


        const playerId = npc.GetPlayerOwnerID();
        // npc.SetRespawnsDisabled(true);
        // npc.AddNoDraw();
        // npc.ForceKill(false);
        PlayerResource.SetCameraTarget(playerId, undefined);

        this.SpawnUndead(npc.GetAbsOrigin(), playerId);

    }



    private SpawnUndead(loc: Vector, playerId: PlayerID) {
        const player = PlayerResource.GetPlayer(playerId)!;

        // todo
        loc.z += 128
        log('Hero pos:', loc)

        ResourceManager.Deposit(playerId, Resource.LUMBER, 400);
        // Create throne




        // npc_dota_building_necropolis
        const closestMine = Utility.FindClosestFreeMine(player.GetAbsOrigin());




        const castle: CDOTA_BaseNPC = BuildingHelper.PlaceBuilding(
            player,
            UnitMap.NECROPOLIS,
            // UnitMap.Crypt,
            loc,
            BuildingHelper.GetConstructionSize(UnitMap.NECROPOLIS),
            BuildingHelper.GetBlockPathingSize(UnitMap.NECROPOLIS),
            0
        )

        Blight.Create(castle, "large");

        castle.SetControllableByPlayer(playerId, true);
        const position: Vector = loc.__add(player.GetForwardVector().__mul(300));

        for (let i = 0; i < 3; i++) {
            const acolyte: CDOTA_BaseNPC = CreateUnitByName(UnitMap.ACOLYTE, position, true, player, player, player.GetTeam());
            acolyte.SetControllableByPlayer(playerId, true);
        }

        for (let i = 0; i < 1; i++) {
            const ghoul: CDOTA_BaseNPC = CreateUnitByName(UnitMap.GHOUL, position, true, player, player, player.GetTeam());
            ghoul.SetControllableByPlayer(playerId, true);
        }
    }



    private LoadMap() {
        if (!IsServer()) return;
        const targets: CBaseEntity[] = Entities.FindAllByClassname("info_target");
        for (const entity of targets) {
            const targetType = entity.Attribute_GetIntValue("TargetType", -1);

            if (targetType == -1) continue;

            if (targetType == 0) {
                const mine = CreateUnitByName(UnitMap.GoldMine, entity.GetAbsOrigin(), false, undefined, undefined, DotaTeam.NEUTRALS) as GoldMine;
                mine.gold = 15000;

                mine.AddNewModifier(mine, undefined, modifier_fake_invul.name, { duration: -1 });
                mine.AddNewModifier(mine, undefined, modifier_gold_mine.name, { duration: -1 });
                // mine.RemoveModifierByName("modifier_invulnerable");
            }

        }

        this.InitTreeHealth();

    }

    private InitTreeHealth() {

        const targets: CBaseEntity[] = Entities.FindAllByClassname("ent_dota_tree");
        targets.forEach(tree => {
            // TODO: make props
            tree.SetMaxHealth(100);
            tree.SetHealth(100);

        })

    }
}
