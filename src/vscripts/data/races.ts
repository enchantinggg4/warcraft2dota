export const Race = {
    UNDEAD: "undead",
    HUMAN: "human",
    ORC: "orc",
    NIGHTELF: "nightelf",
};

export type RaceType = typeof Race[keyof typeof Race];

export const Races: Record<
    RaceType,
    {
        BaseHero: string;
        CityCenterName: string;
        BuilderName: string;
        BuilderCount: number;
        BuilderItems: string[];
    }
> = {
    human: {
        BaseHero: "npc_dota_hero_dragon_knight",
        CityCenterName: "human_town_hall",
        BuilderName: "human_peasant",
        BuilderCount: 5,
        BuilderItems: [
            "item_build_farm",
            "item_build_altar_of_kings",
            "item_build_town_hall",
            "item_build_scout_tower",
            "item_build_arcane_vault",
            "item_build_lumber_mill",
        ],
    },
    orc: {
        BaseHero: "npc_dota_hero_huskar",
        CityCenterName: "orc_great_hall",
        BuilderName: "orc_peon",
        BuilderCount: 5,
        BuilderItems: [
            "item_build_burrow",
            "item_build_altar_of_storms",
            "item_build_great_hall",
            "item_build_war_mill",
            "item_build_voodoo_lounge",
        ],
    },
    nightelf: {
        BaseHero: "npc_dota_hero_furion",
        CityCenterName: "nightelf_tree_of_life",
        BuilderName: "nightelf_wisp",
        BuilderCount: 5,
        BuilderItems: [
            "item_build_moon_well",
            "item_build_altar_of_elders",
            "item_build_tree_of_life",
            "item_build_ancient_of_war",
            "item_build_ancient_of_wonders",
            "item_build_hunters_hall",
        ],
    },
    undead: {
        BaseHero: "npc_dota_hero_life_stealer",
        CityCenterName: "undead_necropolis",
        BuilderName: "undead_acolyte",
        BuilderCount: 3,
        BuilderItems: [
            "item_build_ziggurat",
            "item_build_altar_of_darkness",
            "item_build_necropolis",
            "item_build_haunted_gold_mine",
            "item_build_graveyard",
            "item_build_tomb_of_relics",
        ],
    },
};
