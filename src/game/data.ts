import type { Item, Monster, MapData, ClassData, SkillData, PetData, QuestData, AchievementData, GameState } from './types';

export const itemsDB: Record<string, Item> = {
  w1: { id: 'w1', name: 'Faca de Aprendiz', type: 'weapon', rarity: 1, atk: 5, price: 50, desc: '+5 Ataque' },
  w2: { id: 'w2', name: 'Espada Longa', type: 'weapon', rarity: 2, atk: 15, price: 250, desc: '+15 Ataque' },
  w3: { id: 'w3', name: 'Lâmina do Trovão', type: 'weapon', rarity: 3, atk: 40, price: 1000, desc: '+40 Ataque' },
  w4: { id: 'w4', name: 'Excalibur', type: 'weapon', rarity: 4, atk: 100, price: 5000, desc: '+100 Ataque' },
  w5: { id: 'w5', name: 'Machado Orc', type: 'weapon', rarity: 3, atk: 60, price: 2500, desc: '+60 Ataque' },
  w6: { id: 'w6', name: 'Cajado de Fogo', type: 'weapon', rarity: 3, atk: 35, mp: 50, price: 1200, desc: '+35 Atk, +50 MP' },
  w7: { id: 'w7', name: 'Lança do Destino', type: 'weapon', rarity: 4, atk: 150, price: 10000, desc: '+150 Ataque' },
  w8: { id: 'w8', name: 'Arco Élfico', type: 'weapon', rarity: 3, atk: 55, price: 2200, desc: '+55 Ataque' },
  w9: { id: 'w9', name: 'Katar das Cinzas', type: 'weapon', rarity: 4, atk: 180, price: 15000, desc: '+180 Ataque' },
  a1: { id: 'a1', name: 'Manto de Algodão', type: 'armor', rarity: 1, def: 5, price: 50, desc: '+5 Defesa' },
  a2: { id: 'a2', name: 'Cota de Malha', type: 'armor', rarity: 2, def: 12, price: 250, desc: '+12 Defesa' },
  a3: { id: 'a3', name: 'Armadura Sagrada', type: 'armor', rarity: 3, def: 35, price: 1000, desc: '+35 Defesa' },
  a4: { id: 'a4', name: 'Armadura das Sombras', type: 'armor', rarity: 4, def: 80, price: 5000, desc: '+80 Defesa' },
  a5: { id: 'a5', name: 'Manto do Sábio', type: 'armor', rarity: 3, def: 20, mp: 100, price: 2000, desc: '+20 Def, +100 MP' },
  a6: { id: 'a6', name: 'Armadura de Titânio', type: 'armor', rarity: 4, def: 120, price: 12000, desc: '+120 Defesa' },
  a7: { id: 'a7', name: 'Couraça de Mitril', type: 'armor', rarity: 4, def: 200, price: 25000, desc: '+200 Defesa' },
  ac1: { id: 'ac1', name: 'Anel de Força', type: 'accessory', rarity: 2, atk: 8, price: 300, desc: '+8 Ataque' },
  ac2: { id: 'ac2', name: 'Amuleto de Vitalidade', type: 'accessory', rarity: 2, hp: 100, price: 300, desc: '+100 HP Máx' },
  ac3: { id: 'ac3', name: 'Bracelete de Defesa', type: 'accessory', rarity: 2, def: 8, price: 300, desc: '+8 Defesa' },
  ac4: { id: 'ac4', name: 'Colar Divino', type: 'accessory', rarity: 4, atk: 20, def: 20, hp: 200, price: 3000, desc: '+20 ATK, +20 DEF, +200 HP' },
  ac5: { id: 'ac5', name: 'Brinco Mágico', type: 'accessory', rarity: 3, mp: 150, price: 1500, desc: '+150 MP' },
  ac6: { id: 'ac6', name: 'Núcleo Estelar', type: 'accessory', rarity: 4, atk: 50, def: 50, hp: 500, mp: 500, price: 20000, desc: '+50 ATK/DEF, +500 HP/MP' },
  c1: { id: 'c1', name: 'Poção Vermelha', type: 'consumable', rarity: 1, healHp: 50, price: 20, desc: 'Cura 50 HP' },
  c2: { id: 'c2', name: 'Poção Branca', type: 'consumable', rarity: 2, healHp: 200, price: 80, desc: 'Cura 200 HP' },
  c3: { id: 'c3', name: 'Poção Azul', type: 'consumable', rarity: 2, healMp: 50, price: 100, desc: 'Restaura 50 MP' },
  c4: { id: 'c4', name: 'Poção de Yggdrasil', type: 'consumable', rarity: 4, healHp: 9999, healMp: 9999, price: 500, desc: 'Cura Total HP e MP' },
  u1: { id: 'u1', name: 'Treinamento Físico', type: 'upgrade', rarity: 3, addAtk: 2, addDef: 2, price: 500, desc: '+2 ATK e DEF' },
  u2: { id: 'u2', name: 'Bênção dos Deuses', type: 'upgrade', rarity: 4, addHp: 50, price: 600, desc: '+50 HP Máx' },
  u3: { id: 'u3', name: 'Meditação Profunda', type: 'upgrade', rarity: 3, addMp: 30, price: 600, desc: '+30 MP Máx' },
  w_valk: { id: 'w_valk', name: 'Lâmina da Valquíria', type: 'weapon', rarity: 5, atk: 250, price: 50000, desc: 'Parte do set [Ira da Valquíria]', setId: 'set_valquiria' },
  a_valk: { id: 'a_valk', name: 'Armadura da Valquíria', type: 'armor', rarity: 5, def: 150, price: 50000, desc: 'Parte do set [Ira da Valquíria]', setId: 'set_valquiria' },
  ac1_valk: { id: 'ac1_valk', name: 'Anel da Valquíria', type: 'accessory', rarity: 5, atk: 50, price: 50000, desc: 'Parte do set [Ira da Valquíria]', setId: 'set_valquiria' },
  ac2_valk: { id: 'ac2_valk', name: 'Amuleto da Valquíria', type: 'accessory', rarity: 5, hp: 500, price: 50000, desc: 'Parte do set [Ira da Valquíria]', setId: 'set_valquiria' },
  w_abys: { id: 'w_abys', name: 'Cajado do Abismo', type: 'weapon', rarity: 5, atk: 100, mp: 300, price: 50000, desc: 'Parte do set [Julgamento do Abismo]', setId: 'set_abismo' },
  a_abys: { id: 'a_abys', name: 'Manto do Abismo', type: 'armor', rarity: 5, def: 200, hp: 300, price: 50000, desc: 'Parte do set [Julgamento do Abismo]', setId: 'set_abismo' },
  ac1_abys: { id: 'ac1_abys', name: 'Brinco do Abismo', type: 'accessory', rarity: 5, mp: 500, def: 30, price: 50000, desc: 'Parte do set [Julgamento do Abismo]', setId: 'set_abismo' },
  ac2_abys: { id: 'ac2_abys', name: 'Selo do Abismo', type: 'accessory', rarity: 5, def: 50, price: 50000, desc: 'Parte do set [Julgamento do Abismo]', setId: 'set_abismo' },
};

export const monstersDB: Monster[] = [
  { id: 'm1', name: "Poring de Geleia", lv: 1, hp: 50, maxHp: 50, atk: 3, def: 1, exp: 10, zeny: 5, mapIdx: 0, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_939999af-41e2-441a-8720-1375f91b8129.jpg" },
  { id: 'm2', name: "Fabre da Floresta", lv: 2, hp: 80, maxHp: 80, atk: 4, def: 2, exp: 15, zeny: 8, mapIdx: 0, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_0a6ae2c9-5d84-467f-b597-6054403078b6.jpg" },
  { id: 'm3', name: "Lunático Feroz", lv: 3, hp: 120, maxHp: 120, atk: 6, def: 3, exp: 20, zeny: 12, mapIdx: 0, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_693e4c55-9d9f-4c7d-af61-52e8291efa02.jpg" },
  { id: 'm4', name: "Pupa Casulo", lv: 4, hp: 160, maxHp: 160, atk: 2, def: 6, exp: 25, zeny: 15, mapIdx: 0, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_71af122c-0979-4c08-8b08-c37be41cb8ca.jpg" },
  { id: 'm5', name: "Salgueiro Ancião", lv: 5, hp: 200, maxHp: 200, atk: 9, def: 5, exp: 35, zeny: 20, mapIdx: 0, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_996490a9-e59b-4b88-917d-7cc4ec03e903.jpg" },
  { id: 'm6', name: "Esporo Venenoso", lv: 6, hp: 250, maxHp: 250, atk: 12, def: 6, exp: 50, zeny: 30, mapIdx: 0, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_a959ae41-e288-4597-9823-2b6ad215b164.jpg" },
  { id: 'm7', name: "Rocker Musical", lv: 7, hp: 300, maxHp: 300, atk: 15, def: 8, exp: 70, zeny: 40, mapIdx: 0, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_8e285e55-571e-4f5d-93f9-08c7fd5fd3a8.jpg" },
  { id: 'm8', name: "Poporing Venenoso", lv: 8, hp: 360, maxHp: 360, atk: 18, def: 10, exp: 90, zeny: 50, mapIdx: 0, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_939999af-41e2-441a-8720-1375f91b8129.jpg" },
  { id: 'm9', name: "Tarou Rato", lv: 9, hp: 420, maxHp: 420, atk: 22, def: 12, exp: 120, zeny: 65, mapIdx: 0, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_0a6ae2c9-5d84-467f-b597-6054403078b6.jpg" },
  { id: 'm10', name: "Templário Dourado", lv: 10, hp: 500, maxHp: 500, atk: 25, def: 15, exp: 150, zeny: 80, mapIdx: 1, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_8e285e55-571e-4f5d-93f9-08c7fd5fd3a8.jpg" },
  { id: 'm11', name: "Urso de Pedra", lv: 12, hp: 600, maxHp: 600, atk: 30, def: 20, exp: 200, zeny: 110, mapIdx: 2, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_693e4c55-9d9f-4c7d-af61-52e8291efa02.jpg" },
  { id: 'm12', name: "Minotauro Labiríntico", lv: 15, hp: 850, maxHp: 850, atk: 40, def: 25, exp: 280, zeny: 160, mapIdx: 2, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_71af122c-0979-4c08-8b08-c37be41cb8ca.jpg" },
  { id: 'm13', name: "Urso das Névoas", lv: 20, hp: 1500, maxHp: 1500, atk: 55, def: 35, exp: 450, zeny: 250, mapIdx: 3, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_996490a9-e59b-4b88-917d-7cc4ec03e903.jpg" },
  { id: 'm14', name: "Urso das Sombras", lv: 25, hp: 3000, maxHp: 3000, atk: 85, def: 50, exp: 800, zeny: 400, mapIdx: 4, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_a959ae41-e288-4597-9823-2b6ad215b164.jpg" },
  { id: 'm15', name: "Lobo Abissal", lv: 30, hp: 5000, maxHp: 5000, atk: 120, def: 80, exp: 1500, zeny: 800, mapIdx: 4, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_a959ae41-e288-4597-9823-2b6ad215b164.jpg" },
  { id: 'm16', name: "Golem de Cristal", lv: 35, hp: 8000, maxHp: 8000, atk: 180, def: 120, exp: 2500, zeny: 1200, mapIdx: 4, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_8e285e55-571e-4f5d-93f9-08c7fd5fd3a8.jpg" },
  { id: 'm17', name: "Espírito das Chamas", lv: 40, hp: 12000, maxHp: 12000, atk: 250, def: 150, exp: 4000, zeny: 2000, mapIdx: 4, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_939999af-41e2-441a-8720-1375f91b8129.jpg" },
  { id: 'm18', name: "Valquíria Sombria", lv: 50, hp: 20000, maxHp: 20000, atk: 400, def: 200, exp: 7000, zeny: 4000, mapIdx: 4, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_71af122c-0979-4c08-8b08-c37be41cb8ca.jpg" },
  { id: 'm19', name: "Zumbi", lv: 55, hp: 25000, maxHp: 25000, atk: 450, def: 200, exp: 8000, zeny: 4500, mapIdx: 5, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_0a6ae2c9-5d84-467f-b597-6054403078b6.jpg" },
  { id: 'm20', name: "Esqueleto", lv: 60, hp: 30000, maxHp: 30000, atk: 500, def: 250, exp: 10000, zeny: 5000, mapIdx: 5, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_a959ae41-e288-4597-9823-2b6ad215b164.jpg" },
  { id: 'm21', name: "Múmia", lv: 65, hp: 40000, maxHp: 40000, atk: 600, def: 300, exp: 12000, zeny: 6000, mapIdx: 5, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_693e4c55-9d9f-4c7d-af61-52e8291efa02.jpg" },
  { id: 'm22', name: "Cavaleiro Sanguinário", lv: 70, hp: 50000, maxHp: 50000, atk: 700, def: 400, exp: 15000, zeny: 8000, mapIdx: 5, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_71af122c-0979-4c08-8b08-c37be41cb8ca.jpg" },
  { id: 'm23', name: "Magmaring", lv: 75, hp: 60000, maxHp: 60000, atk: 850, def: 450, exp: 18000, zeny: 10000, mapIdx: 6, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_939999af-41e2-441a-8720-1375f91b8129.jpg" },
  { id: 'm24', name: "Golem de Lava", lv: 80, hp: 80000, maxHp: 80000, atk: 1000, def: 600, exp: 25000, zeny: 12000, mapIdx: 6, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_8e285e55-571e-4f5d-93f9-08c7fd5fd3a8.jpg" },
  { id: 'm25', name: "Salamandra", lv: 85, hp: 100000, maxHp: 100000, atk: 1200, def: 700, exp: 30000, zeny: 15000, mapIdx: 6, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_996490a9-e59b-4b88-917d-7cc4ec03e903.jpg" },
  { id: 'm26', name: "Ifrit Falso", lv: 90, hp: 150000, maxHp: 150000, atk: 1500, def: 900, exp: 45000, zeny: 20000, mapIdx: 6, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_a959ae41-e288-4597-9823-2b6ad215b164.jpg" },
  { id: 'm27', name: "Anjo Guardião", lv: 95, hp: 200000, maxHp: 200000, atk: 2000, def: 1200, exp: 60000, zeny: 30000, mapIdx: 7, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_0a6ae2c9-5d84-467f-b597-6054403078b6.jpg" },
  { id: 'm28', name: "Querubim", lv: 100, hp: 250000, maxHp: 250000, atk: 2500, def: 1500, exp: 80000, zeny: 40000, mapIdx: 7, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_a959ae41-e288-4597-9823-2b6ad215b164.jpg" },
  { id: 'm29', name: "Arcanjo", lv: 105, hp: 350000, maxHp: 350000, atk: 3000, def: 1800, exp: 120000, zeny: 50000, mapIdx: 7, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_693e4c55-9d9f-4c7d-af61-52e8291efa02.jpg" },
  { id: 'm30', name: "Valquíria", lv: 110, hp: 500000, maxHp: 500000, atk: 4000, def: 2500, exp: 200000, zeny: 80000, mapIdx: 7, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_71af122c-0979-4c08-8b08-c37be41cb8ca.jpg" },
  { id: 'm31', name: "Dragão Vermelho", lv: 115, hp: 750000, maxHp: 750000, atk: 5500, def: 3500, exp: 350000, zeny: 120000, mapIdx: 8, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_939999af-41e2-441a-8720-1375f91b8129.jpg" },
  { id: 'm32', name: "Dragão Azul", lv: 120, hp: 1000000, maxHp: 1000000, atk: 7000, def: 4500, exp: 500000, zeny: 200000, mapIdx: 8, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_8e285e55-571e-4f5d-93f9-08c7fd5fd3a8.jpg" },
  { id: 'm33', name: "Dragão Dourado", lv: 125, hp: 1500000, maxHp: 1500000, atk: 9000, def: 6000, exp: 800000, zeny: 350000, mapIdx: 8, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_996490a9-e59b-4b88-917d-7cc4ec03e903.jpg" },
  { id: 'm34', name: "Rei Dragão", lv: 130, hp: 2500000, maxHp: 2500000, atk: 12000, def: 8000, exp: 1500000, zeny: 600000, mapIdx: 8, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_a959ae41-e288-4597-9823-2b6ad215b164.jpg" },
  { id: 'm35', name: "Senhor do Tempo", lv: 135, hp: 4000000, maxHp: 4000000, atk: 18000, def: 12000, exp: 3000000, zeny: 1000000, mapIdx: 9, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_0a6ae2c9-5d84-467f-b597-6054403078b6.jpg" },
  { id: 'm36', name: "Ceifador de Almas", lv: 140, hp: 6000000, maxHp: 6000000, atk: 25000, def: 18000, exp: 5000000, zeny: 2000000, mapIdx: 9, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_a959ae41-e288-4597-9823-2b6ad215b164.jpg" },
  { id: 'm37', name: "Vazio Insaciável", lv: 145, hp: 10000000, maxHp: 10000000, atk: 40000, def: 25000, exp: 10000000, zeny: 5000000, mapIdx: 9, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_693e4c55-9d9f-4c7d-af61-52e8291efa02.jpg" },
  { id: 'm38', name: "Deus Caído", lv: 150, hp: 25000000, maxHp: 25000000, atk: 80000, def: 50000, exp: 30000000, zeny: 15000000, mapIdx: 9, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_71af122c-0979-4c08-8b08-c37be41cb8ca.jpg" },
];

export const bossesDB: Monster[] = [
  { id: 'b1', name: "Rei Orc", lv: 5, hp: 800, maxHp: 800, atk: 25, def: 10, exp: 200, zeny: 500, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_0a6ae2c9-5d84-467f-b597-6054403078b6.jpg", isBoss: true },
  { id: 'b2', name: "Senhor das Trevas", lv: 10, hp: 1500, maxHp: 1500, atk: 45, def: 20, exp: 500, zeny: 1500, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_a959ae41-e288-4597-9823-2b6ad215b164.jpg", isBoss: true },
  { id: 'b3', name: "Cavaleiro do Abismo", lv: 15, hp: 3000, maxHp: 3000, atk: 70, def: 30, exp: 900, zeny: 3000, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_693e4c55-9d9f-4c7d-af61-52e8291efa02.jpg", isBoss: true },
  { id: 'b4', name: "Bafomé", lv: 20, hp: 5000, maxHp: 5000, atk: 120, def: 50, exp: 1500, zeny: 5000, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_71af122c-0979-4c08-8b08-c37be41cb8ca.jpg", isBoss: true },
  { id: 'b5', name: "Rainha Gelo", lv: 25, hp: 8000, maxHp: 8000, atk: 180, def: 80, exp: 2500, zeny: 8000, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_939999af-41e2-441a-8720-1375f91b8129.jpg", isBoss: true },
  { id: 'b6', name: "Dragão Ancestral", lv: 30, hp: 15000, maxHp: 15000, atk: 250, def: 120, exp: 4000, zeny: 12000, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_8e285e55-571e-4f5d-93f9-08c7fd5fd3a8.jpg", isBoss: true },
  { id: 'b7', name: "Kraken", lv: 35, hp: 25000, maxHp: 25000, atk: 350, def: 180, exp: 6000, zeny: 20000, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_996490a9-e59b-4b88-917d-7cc4ec03e903.jpg", isBoss: true },
  { id: 'b8', name: "Behemoth", lv: 40, hp: 40000, maxHp: 40000, atk: 500, def: 250, exp: 10000, zeny: 35000, img: "https://miaoda-site-img.s3cdn.medo.dev/images/KLing_a959ae41-e288-4597-9823-2b6ad215b164.jpg", isBoss: true },
];

export const mapsDB: MapData[] = [
  { name: "Floresta Silvestre", req: 0, bg: "bg-forest" },
  { name: "Templo de Ouro", req: 10, bg: "bg-desert" },
  { name: "Labirinto Sagrado", req: 15, bg: "bg-cave" },
  { name: "Lagoa das Névoas", req: 20, bg: "bg-tower" },
  { name: "Ruínas Sombrias", req: 25, bg: "bg-castle" },
  { name: "Caverna do Magma", req: 30, bg: "bg-volcano" },
  { name: "Santuário Celeste", req: 35, bg: "bg-dungeon" },
  { name: "Caverna Sombria", req: 40, bg: "bg-cave" },
  { name: "Vulcão Ativo", req: 45, bg: "bg-volcano" },
  { name: "Ninho dos Dragões", req: 55, bg: "bg-castle" },
  { name: "Dimensão do Fim", req: 60, bg: "bg-dungeon" },
];

export const classesDB: Record<string, ClassData> = {
  novato: { id: 'novato', name: 'Novato Baby', reqLv: 1, desc: 'A classe básica.', b_atk: 0, b_def: 0, b_hp: 0, b_mp: 0, avatar: '👶' },
  jovem: { id: 'jovem', name: 'Jovem', reqLv: 10, desc: 'Evolução. Concede +5 permanentemente em TODOS os Atributos!', b_atk: 0, b_def: 0, b_hp: 0, b_mp: 0, avatar: '👦' },
  espadachim: { id: 'espadachim', name: 'Espadachim', reqLv: 20, desc: '+15 ATK, +15 DEF, +100 HP', b_atk: 15, b_def: 15, b_hp: 100, b_mp: 0, avatar: '⚔️' },
  mago: { id: 'mago', name: 'Mago', reqLv: 20, desc: '+10 ATK, +200 MP', b_atk: 10, b_def: 5, b_hp: 20, b_mp: 200, avatar: '🧙' },
  arqueiro: { id: 'arqueiro', name: 'Arqueiro', reqLv: 20, desc: '+25 ATK', b_atk: 25, b_def: 8, b_hp: 40, b_mp: 50, avatar: '🏹' },
  gatiuno: { id: 'gatiuno', name: 'Gatuno', reqLv: 20, desc: '+20 ATK, chance de ataques críticos altos', b_atk: 30, b_def: 5, b_hp: 50, b_mp: 20, avatar: '🥷' },
  cavaleiro: { id: 'cavaleiro', name: 'Cavaleiro', reqLv: 40, desc: '+50 ATK, +50 DEF, +400 HP', b_atk: 50, b_def: 50, b_hp: 400, b_mp: 100, avatar: '🛡️' },
  templario: { id: 'templario', name: 'Templário', reqLv: 40, desc: '+30 ATK, +80 DEF, +600 HP', b_atk: 30, b_def: 80, b_hp: 600, b_mp: 150, avatar: '🏰' },
  bruxo: { id: 'bruxo', name: 'Bruxo', reqLv: 40, desc: '+40 ATK, +500 MP', b_atk: 40, b_def: 20, b_hp: 100, b_mp: 500, avatar: '🔮' },
  sabio: { id: 'sabio', name: 'Sábio', reqLv: 40, desc: '+25 ATK, +20 DEF, +400 MP, +100 HP', b_atk: 25, b_def: 20, b_hp: 100, b_mp: 400, avatar: '📖' },
  cacador: { id: 'cacador', name: 'Caçador', reqLv: 40, desc: '+60 ATK, +15 DEF', b_atk: 60, b_def: 15, b_hp: 120, b_mp: 100, avatar: '🦅' },
  mercenario: { id: 'mercenario', name: 'Mercenário', reqLv: 40, desc: '+70 ATK, +10 DEF', b_atk: 70, b_def: 10, b_hp: 150, b_mp: 50, avatar: '🗡️' },
  lordedragao: { id: 'lordedragao', name: 'Lorde Dragão', reqLv: 80, desc: '+150 ATK, +150 DEF, +1000 HP', b_atk: 150, b_def: 150, b_hp: 1000, b_mp: 300, avatar: '🐉' },
  paladino: { id: 'paladino', name: 'Paladino Real', reqLv: 80, desc: '+100 ATK, +250 DEF, +2000 HP', b_atk: 100, b_def: 250, b_hp: 2000, b_mp: 500, avatar: '🛡️' },
  arcanjo: { id: 'arcanjo', name: 'Arquimago', reqLv: 80, desc: '+200 MATK, +1500 MP', b_atk: 50, b_def: 80, b_hp: 500, b_mp: 1500, avatar: '🌪️' },
  feiticeiro: { id: 'feiticeiro', name: 'Feiticeiro', reqLv: 80, desc: '+100 MATK, +100 DEF, +1200 MP', b_atk: 80, b_def: 100, b_hp: 800, b_mp: 1200, avatar: '📜' },
  atirador: { id: 'atirador', name: 'Atirador de Elite', reqLv: 80, desc: '+250 ATK', b_atk: 250, b_def: 50, b_hp: 600, b_mp: 200, avatar: '🎯' },
  sicario: { id: 'sicario', name: 'Sicário', reqLv: 80, desc: '+300 ATK', b_atk: 300, b_def: 40, b_hp: 700, b_mp: 150, avatar: '☠️' },
};

export const classTree: Record<string, string[]> = {
  novato: ['jovem'],
  jovem: ['espadachim', 'mago', 'arqueiro', 'gatiuno'],
  espadachim: ['cavaleiro', 'templario'],
  mago: ['bruxo', 'sabio'],
  arqueiro: ['cacador'],
  gatiuno: ['mercenario'],
  cavaleiro: ['lordedragao'],
  templario: ['paladino'],
  bruxo: ['arcanjo'],
  sabio: ['feiticeiro'],
  cacador: ['atirador'],
  mercenario: ['sicario'],
  lordedragao: [], paladino: [], arcanjo: [], feiticeiro: [], atirador: [], sicario: [],
};

export const skillsDB: Record<string, SkillData> = {
  s1: { id: 's1', name: 'Ataque Duplo', type: 'attack', mpCost: 10, cooldown: 3, power: 2, icon: '⚔️', reqClass: 'espadachim', effect: 'effect-buff', desc: 'Causa 2x o seu dano de Ataque.' },
  s2: { id: 's2', name: 'Bola de Fogo', type: 'attack', mpCost: 20, cooldown: 4, power: 3, icon: '🔥', reqClass: 'mago', effect: 'effect-fire', desc: 'Dano mágico: 3x seu Ataque.' },
  s3: { id: 's3', name: 'Cura Menor', type: 'heal', mpCost: 15, cooldown: 5, power: 50, icon: '💚', reqClass: 'novato', effect: 'effect-heal', desc: 'Restaura 50 de HP.' },
  s4: { id: 's4', name: 'Fúria', type: 'buff', mpCost: 30, cooldown: 10, power: 1.5, duration: 5, icon: '💢', reqClass: 'cavaleiro', effect: 'effect-buff', desc: 'Aumenta Ataque em 50% por 5s.' },
  s5: { id: 's5', name: 'Meteoro', type: 'attack', mpCost: 50, cooldown: 8, power: 6, icon: '☄️', reqClass: 'bruxo', effect: 'effect-fire', desc: 'Dano mágico massivo: 6x Ataque.' },
};

export const petsDB: PetData[] = [
  { id: 'pet1', name: 'Poringzinho', icon: '💧', baseAtk: 2, baseBuffAtk: 1.05, desc: '+5% ATK, ataca inimigos.', evolutionId: 'pet1_evo' },
  { id: 'pet1_evo', name: 'Angeling', icon: '👼', baseAtk: 10, baseBuffAtk: 1.15, desc: '+15% ATK, ataca inimigos.', skill: 's3', isEvo: true },
  { id: 'pet2', name: 'Lobinho', icon: '🐺', baseAtk: 5, baseBuffAtk: 1.10, desc: '+10% ATK, ataca inimigos.', evolutionId: 'pet2_evo' },
  { id: 'pet2_evo', name: 'Lobo Selvagem', icon: '🐺', baseAtk: 20, baseBuffAtk: 1.20, desc: '+20% ATK, ataca inimigos.', skill: 's1', isEvo: true },
  { id: 'pet3', name: 'Bafomé Jr.', icon: '🐐', baseAtk: 15, baseBuffAtk: 1.25, desc: '+25% ATK, atalhos de chefes.', evolutionId: 'pet3_evo' },
  { id: 'pet3_evo', name: 'Bafomé', icon: '👿', baseAtk: 50, baseBuffAtk: 1.50, desc: '+50% ATK, atalhos.', skill: 's5', isEvo: true },
];

export const questsDB: QuestData[] = [
  { id: 'q1', name: 'Limpeza do Bosque', desc: 'Derrote 10 Poring de Geleia', type: 'kill', target: 'm1', req: 10, rewardZeny: 100, rewardExp: 50 },
  { id: 'q2', name: 'Ameaça Crescente', desc: 'Derrote 5 Ursos de Pedra', type: 'kill', target: 'm11', req: 5, rewardZeny: 500, rewardExp: 200 },
  { id: 'q3', name: 'Prove seu Valor', desc: 'Derrote o Rei Orc', type: 'kill_boss', target: 'b1', req: 1, rewardZeny: 1500, rewardExp: 1000 },
];

export const achievementsDB: AchievementData[] = [
  { id: 'ach1', name: "Caçador Iniciante", desc: "Derrote 10 monstros", req: 10, type: 'monsters' },
  { id: 'ach2', name: "Caçador Experiente", desc: "Derrote 100 monstros", req: 100, type: 'monsters' },
  { id: 'ach3', name: "Mestre do Ouro", desc: "Acumule 5000 Zeny", req: 5000, type: 'zeny' },
  { id: 'ach4', name: "Sobrevivente", desc: "Use 20 poções", req: 20, type: 'potions' },
  { id: 'ach5', name: "Primeira Sorte", desc: "Receba 1 Bônus Monstruoso", req: 1, type: 'bonus' },
  { id: 'ach6', name: "Sortudo", desc: "Receba 10 Bônus Monstruosos", req: 10, type: 'bonus' },
  { id: 'ach7', name: "Abençoado", desc: "Receba 50 Bônus Monstruosos", req: 50, type: 'bonus' },
  { id: 'ach8', name: "Assassino de Chefes", desc: "Derrote 1 Chefe", req: 1, type: 'bosses' },
];

export const prefixesDB = [
  { name: "Sólido", stat: "def", val: 5, element: null },
  { name: "Afiado", stat: "atk", val: 8, element: null },
  { name: "Flamejante", stat: "atk", val: 5, element: "Fogo" },
  { name: "Gélido", stat: "atk", val: 5, element: "Água" },
  { name: "Pesado", stat: "def", val: 10, element: "Terra" },
  { name: "Leve", stat: "atk", val: 5, element: "Vento" },
  { name: "Divino", stat: "atk", val: 12, element: "Luz" },
  { name: "Sombrio", stat: "atk", val: 15, element: "Trevas" },
];

export const suffixesDB = [
  { name: "da Força", stat: "atk", val: 10 },
  { name: "da Vitalidade", stat: "hp", val: 50 },
  { name: "da Defesa", stat: "def", val: 8 },
  { name: "da Inteligência", stat: "mp", val: 40 },
  { name: "do Titã", stat: "hp", val: 150 },
  { name: "do Assassino", stat: "atk", val: 25 },
];

export const setsDB: Record<string, { name: string; pieces: string[]; bonuses: Record<number, { type: string; val: number; desc: string }> }> = {
  set_valquiria: {
    name: "Ira da Valquíria",
    pieces: ['w_valk', 'a_valk', 'ac1_valk', 'ac2_valk'],
    bonuses: {
      2: { type: 'atk', val: 50, desc: '+50 ATK' },
      3: { type: 'hp', val: 1000, desc: '+1000 HP Máximo' },
      4: { type: 'atkMult', val: 1.2, desc: '+20% de Dano Total' },
    },
  },
  set_abismo: {
    name: "Julgamento do Abismo",
    pieces: ['w_abys', 'a_abys', 'ac1_abys', 'ac2_abys'],
    bonuses: {
      2: { type: 'def', val: 100, desc: '+100 DEF' },
      3: { type: 'matk', val: 150, desc: '+150 MATK' },
      4: { type: 'defMult', val: 1.3, desc: '+30% de Defesa Total' },
    },
  },
};

export const gemsDB: Record<string, { id: string; name: string; stat: string; color: string; desc: string }> = {
  gem_rubi: { id: 'gem_rubi', name: 'Rubi', stat: 'str', color: 'rubi', desc: '+ STR' },
  gem_safira: { id: 'gem_safira', name: 'Safira', stat: 'int', color: 'safira', desc: '+ INT' },
  gem_esmeralda: { id: 'gem_esmeralda', name: 'Esmeralda', stat: 'agi', color: 'esmeralda', desc: '+ AGI' },
  gem_topazio: { id: 'gem_topazio', name: 'Topázio', stat: 'dex', color: 'topazio', desc: '+ DEX' },
  gem_ametista: { id: 'gem_ametista', name: 'Ametista', stat: 'vit', color: 'ametista', desc: '+ VIT' },
  gem_diamante: { id: 'gem_diamante', name: 'Diamante', stat: 'luk', color: 'diamante', desc: '+ LUK' },
};

const ELEMENTS = ["Fogo", "Água", "Terra", "Vento", "Luz", "Trevas", "Neutro"];
export function getRandomElement(): string {
  return ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];
}

export const INITIAL_STATE: GameState = {
  hero: {
    lv: 1, exp: 0, nextExp: 100,
    hp: 100, baseMaxHp: 100,
    mp: 50, baseMaxMp: 50,
    baseAtk: 5, baseDef: 5,
    str: 1, agi: 1, vit: 1, int: 1, dex: 1, luk: 1,
    points: 0, zeny: 0,
    job: 'novato',
  },
  stats: {
    monstersDefeated: 0,
    totalZenyEarned: 0,
    potionsUsed: 0,
    bonusReceived: 0,
    bossesDefeated: 0,
    reborns: 0,
  },
  inventory: [],
  inventoryCapacity: 20,
  equipment: { weapon: null, armor: null, acc1: null, acc2: null },
  skills: { unlocked: ['s3'], equipped: [null, null, null, null] },
  pet: { active: null, collection: [] },
  tavern: { activeQuests: [], completedQuests: [] },
  progress: {
    currentMapIdx: 0,
    highestMapIdx: 0,
    monstersInCurrentMap: 0,
    bestiary: {},
    achievements: {},
    completedCycles: 0,
    bonusHistory: [],
    bossAvailable: false,
    dungeonEntries: 3,
    lastDungeonDate: new Date().toDateString(),
  },
  settings: { soundOn: false, autoAttackOn: false },
  currentMonster: null,
  isBossFight: false,
  isDungeon: false,
  dungeonPhase: 1,
  isRift: false,
  riftFloor: 0,
  riftRecord: 0,
  currentMonsterKills: 0,
  activeBuffs: [],
  skillCooldowns: {},
  ranking: [],
};
