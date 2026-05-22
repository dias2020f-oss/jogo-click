export type ItemType = 'weapon' | 'armor' | 'accessory' | 'consumable' | 'upgrade';
export type Rarity = 1 | 2 | 3 | 4 | 5;
export type StatKey = 'str' | 'agi' | 'vit' | 'int' | 'dex' | 'luk';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: Rarity;
  atk?: number;
  def?: number;
  hp?: number;
  mp?: number;
  price: number;
  desc: string;
  setId?: string;
  healHp?: number;
  healMp?: number;
  addAtk?: number;
  addDef?: number;
  addHp?: number;
  addMp?: number;
  element?: string;
  sockets?: Array<{ id: string; level: number } | null>;
  flee?: number;
  cri?: number;
}

export interface InventoryItem {
  id: string;
  templateId?: string;
  qty: number;
  name?: string;
  atk?: number;
  def?: number;
  hp?: number;
  mp?: number;
  element?: string;
  rarity?: Rarity;
  sockets?: Array<{ id: string; level: number } | null>;
}

export interface Monster {
  id: string;
  name: string;
  lv: number;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  exp: number;
  zeny: number;
  mapIdx?: number;
  img: string;
  isBoss?: boolean;
  element?: string;
}

export interface MapData {
  name: string;
  req: number;
  bg?: string;
}

export interface ClassData {
  id: string;
  name: string;
  reqLv: number;
  desc: string;
  b_atk: number;
  b_def: number;
  b_hp: number;
  b_mp: number;
  avatar: string;
}

export interface SkillData {
  id: string;
  name: string;
  type: 'attack' | 'heal' | 'buff';
  mpCost: number;
  cooldown: number;
  power: number;
  duration?: number;
  icon: string;
  reqClass: string;
  effect: string;
  desc: string;
}

export interface PetData {
  id: string;
  name: string;
  icon: string;
  baseAtk: number;
  baseBuffAtk: number;
  desc: string;
  evolutionId?: string;
  skill?: string;
  isEvo?: boolean;
}

export interface PetInstance {
  id: string;
  lv: number;
  exp: number;
  nextExp: number;
}

export interface QuestData {
  id: string;
  name: string;
  desc: string;
  type: 'kill' | 'kill_boss';
  target: string;
  req: number;
  rewardZeny: number;
  rewardExp: number;
}

export interface ActiveQuest {
  id: string;
  progress: number;
}

export interface AchievementData {
  id: string;
  name: string;
  desc: string;
  req: number;
  type: 'monsters' | 'zeny' | 'potions' | 'bonus' | 'bosses';
}

export interface BonusHistoryEntry {
  time: string;
  monsterName: string;
  zeny: number;
  xp: number;
}

export interface BestiaryEntry {
  discovered: boolean;
  killed: number;
}

export interface EquipmentSlots {
  weapon: InventoryItem | null;
  armor: InventoryItem | null;
  acc1: InventoryItem | null;
  acc2: InventoryItem | null;
}

export interface GameState {
  hero: {
    lv: number;
    exp: number;
    nextExp: number;
    hp: number;
    baseMaxHp: number;
    mp: number;
    baseMaxMp: number;
    baseAtk: number;
    baseDef: number;
    str: number;
    agi: number;
    vit: number;
    int: number;
    dex: number;
    luk: number;
    points: number;
    zeny: number;
    job: string;
  };
  stats: {
    monstersDefeated: number;
    totalZenyEarned: number;
    potionsUsed: number;
    bonusReceived: number;
    bossesDefeated: number;
    reborns: number;
  };
  inventory: InventoryItem[];
  inventoryCapacity: number;
  equipment: EquipmentSlots;
  skills: {
    unlocked: string[];
    equipped: (string | null)[];
  };
  pet: {
    active: string | null;
    collection: PetInstance[];
  };
  tavern: {
    activeQuests: ActiveQuest[];
    completedQuests: string[];
  };
  progress: {
    currentMapIdx: number;
    highestMapIdx: number;
    monstersInCurrentMap: number;
    bestiary: Record<string, BestiaryEntry>;
    achievements: Record<string, { claimed: boolean }>;
    completedCycles: number;
    bonusHistory: BonusHistoryEntry[];
    bossAvailable: boolean;
    dungeonEntries: number;
    lastDungeonDate: string;
  };
  settings: {
    soundOn: boolean;
    autoAttackOn: boolean;
  };
  currentMonster: Monster | null;
  isBossFight: boolean;
  isDungeon: boolean;
  dungeonPhase: number;
  isRift: boolean;
  riftFloor: number;
  riftRecord: number;
  currentMonsterKills: number;
  activeBuffs: Array<{ type: string; mult: number; expireTime: number }>;
  skillCooldowns: Record<string, number>;
  ranking: Array<{ cycle: number; lv: number; zeny: number; time: string }>;
}
