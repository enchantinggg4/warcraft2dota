export const ResearchMap = {
    NightElfResistantSkin: "nightelf_research_resistant_skin",







    OrcBerserker: "orc_research_berserker_upgrade"





}

type Research = typeof ResearchMap[keyof typeof  ResearchMap]



export class ResearchManager {


    public static HasResearch(playerId: PlayerID, research: Research): boolean {
        return false
    }
}