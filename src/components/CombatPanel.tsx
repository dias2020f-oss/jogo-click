import React, { useState, useEffect } from 'react';
import { useGame } from '@/game/context';
import { mapsDB, classesDB, skillsDB } from '@/game/data';
import { getCalculatedStats } from '@/game/engine';

export function CombatPanel() {
  const { state, dispatch, damagePops, avatarAnim, monsterAnim, bonusBanner, bossModalVisible, setBossModalVisible } = useGame();
  const { hero, currentMonster, isBossFight, isDungeon, dungeonPhase, isRift, riftFloor, settings, skills, skillCooldowns } = state;
  const stats = getCalculatedStats(state);
  const [, forceRender] = useState(0);

  // Force re-render every 100ms for cooldown display
  useEffect(() => {
    const id = setInterval(() => forceRender(n => n + 1), 100);
    return () => clearInterval(id);
  }, []);

  const currentMap = mapsDB[state.progress.currentMapIdx] || mapsDB[0];
  const nextMap = mapsDB[state.progress.currentMapIdx + 1];
  const progressTarget = nextMap ? nextMap.req : 999999;
  const progressPct = nextMap ? Math.min(100, (state.progress.monstersInCurrentMap / progressTarget) * 100) : 100;

  let mapLabel = currentMap.name;
  if (isDungeon) mapLabel = `Templo de Ouro - Fase ${dungeonPhase}`;
  if (isRift) mapLabel = `Fenda Abissal - Andar ${riftFloor}`;

  const bgClass = isDungeon ? 'bg-dungeon' : (isRift ? 'bg-castle' : (currentMap.bg || 'bg-forest'));

  const cls = classesDB[hero.job] || classesDB['novato'];
  const hpPct = stats.maxHp > 0 ? Math.min(100, (hero.hp / stats.maxHp) * 100) : 0;
  const mpPct = stats.maxMp > 0 ? Math.min(100, (hero.mp / stats.maxMp) * 100) : 0;
  const expPct = hero.nextExp > 0 ? Math.min(100, (hero.exp / hero.nextExp) * 100) : 0;
  const monsterHpPct = currentMonster && currentMonster.maxHp > 0
    ? Math.min(100, (currentMonster.hp / currentMonster.maxHp) * 100)
    : 0;

  const now = Date.now();

  return (
    <aside className="flex flex-col bg-card border-l-2 border-black" style={{ width: '340px', minWidth: '280px', flexShrink: 0 }}>
      {/* Bonus Banner */}
      <div
        className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
        style={{ transition: 'transform 0.3s', transform: bonusBanner.visible ? 'translateY(0)' : 'translateY(-120%)' }}
      >
        <div className="bg-teal-600 text-white font-bold px-6 py-3 text-sm text-center rounded-b-lg border-2 border-teal-400 shadow-lg">
          ✨ BONUS MONSTRUOSO! +{bonusBanner.zeny} Zeny  +{bonusBanner.xp} XP ✨
        </div>
      </div>

      {/* Boss Modal */}
      {bossModalVisible && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" data-testid="boss-modal">
          <div className="bg-card border-2 border-yellow-500 rounded-lg p-6 max-w-sm text-center">
            <div className="text-2xl mb-2">⚔️</div>
            <h2 className="font-heading text-yellow-400 text-sm mb-3">CHEFE DISPONÍVEL!</h2>
            <p className="text-sm text-muted-foreground mb-4">Um poderoso inimigo aguarda. Deseja enfrentá-lo?</p>
            <div className="flex gap-3">
              <button
                className="flex-1 py-2 bg-red-700 border-2 border-black text-white text-xs font-bold uppercase rounded cursor-pointer"
                onClick={() => { setBossModalVisible(false); dispatch({ type: 'START_BOSS_FIGHT' }); }}
                data-testid="button-fight-boss"
              >
                Lutar
              </button>
              <button
                className="flex-1 py-2 bg-popover border-2 border-black text-white text-xs font-bold uppercase rounded cursor-pointer"
                onClick={() => { setBossModalVisible(false); dispatch({ type: 'SKIP_BOSS' }); }}
                data-testid="button-skip-boss"
              >
                Ignorar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Header */}
      <div className="h-14 bg-popover border-b-2 border-black flex items-center px-3 gap-2 shrink-0">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-secondary truncate">{mapLabel}</div>
          <div className="flex items-center gap-1 mt-0.5">
            <div className="flex-1 h-1.5 bg-black rounded overflow-hidden">
              <div className="h-full bg-yellow-500 transition-all duration-300" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="text-[9px] text-muted-foreground shrink-0">
              {isDungeon || isRift ? '' : `${state.progress.monstersInCurrentMap}/${nextMap ? progressTarget : '∞'}`}
            </span>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <button
            className="w-8 h-8 bg-popover border-2 border-black text-white text-xs rounded cursor-pointer disabled:opacity-30"
            disabled={state.progress.currentMapIdx <= 0 || isDungeon || isRift || isBossFight}
            onClick={() => dispatch({ type: 'CHANGE_MAP', dir: -1 })}
            data-testid="button-prev-map"
          >◀</button>
          <button
            className="w-8 h-8 bg-popover border-2 border-black text-white text-xs rounded cursor-pointer disabled:opacity-30"
            disabled={state.progress.currentMapIdx >= state.progress.highestMapIdx || isDungeon || isRift || isBossFight}
            onClick={() => dispatch({ type: 'CHANGE_MAP', dir: 1 })}
            data-testid="button-next-map"
          >▶</button>
        </div>
      </div>

      {/* Arena */}
      <div
        className={`relative flex flex-col items-center justify-center overflow-hidden ${bgClass}`}
        style={{ flex: 1, minHeight: 0 }}
        data-testid="combat-arena"
      >
        {/* Damage pops */}
        {damagePops.map(pop => (
          <div
            key={pop.id}
            className={`absolute pointer-events-none font-bold text-sm z-20 animate-float-up
              ${pop.type === 'hit' ? 'text-red-300' : ''}
              ${pop.type === 'auto' ? 'text-orange-400' : ''}
              ${pop.type === 'heal' ? 'text-green-400' : ''}
              ${pop.type === 'crit' ? 'text-yellow-300 text-base' : ''}
              ${pop.type === 'info' ? 'text-blue-300 text-xs' : ''}
            `}
            style={{ left: `${pop.x}%`, top: `${pop.y}%`, textShadow: '1px 1px 0 #000, -1px 1px 0 #000' }}
          >
            {pop.text}
          </div>
        ))}

        {currentMonster && (
          <>
            {/* Monster info */}
            <div className="text-center mb-2 z-10" style={{ textShadow: '1px 1px 0 #000' }}>
              <div className="font-bold text-sm text-foreground">
                {currentMonster.name}
                {' '}
                <span className="text-xs text-muted-foreground">
                  {isBossFight ? '[CHEFE]' : `Lv ${currentMonster.lv}`}
                </span>
                {' '}
                {currentMonster.element && (
                  <span className="text-xs" style={{ color: getElementColor(currentMonster.element) }}>({currentMonster.element})</span>
                )}
              </div>
              {!isBossFight && (
                <div className="text-xs text-muted-foreground">{state.currentMonsterKills + 1}/3</div>
              )}
            </div>

            {/* HP Bar */}
            <div className="w-40 mb-2 z-10">
              <div className="text-[10px] text-center text-muted-foreground mb-0.5">{currentMonster.hp.toLocaleString()} / {currentMonster.maxHp.toLocaleString()}</div>
              <div className="h-3 bg-black border border-black/50 rounded overflow-hidden">
                <div
                  className="h-full transition-all duration-100"
                  style={{ width: `${monsterHpPct}%`, backgroundColor: '#8b0000' }}
                />
              </div>
            </div>

            {/* Monster Sprite */}
            <div
              className="z-10"
              style={{
                width: 160, height: 160,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transform: monsterAnim === 'hit' ? 'translateX(-8px) scale(1.05)' : 'translateX(0)',
                transition: 'transform 0.1s',
              }}
            >
              <img
                src={currentMonster.img}
                alt={currentMonster.name}
                className="max-w-full max-h-full object-contain"
                style={{ imageRendering: 'auto' }}
              />
            </div>
          </>
        )}

        {/* Player avatar */}
        <div
          className="absolute left-4 bottom-4 text-4xl z-10"
          style={{
            animation: avatarAnim === 'idle' ? 'avatarBob 2s infinite ease-in-out'
              : avatarAnim === 'attack' ? 'avatarStrike 0.33s forwards steps(3)'
              : avatarAnim === 'victory' ? 'avatarJump 1s forwards ease-in-out'
              : 'none',
            filter: avatarAnim === 'defeat' ? 'grayscale(100%)' : 'none',
            transform: avatarAnim === 'defeat' ? 'rotate(-90deg) translateY(10px)' : '',
            transition: avatarAnim === 'defeat' ? 'transform 0.5s' : '',
          }}
        >
          {cls.avatar}
        </div>

        {/* Pet avatar */}
        {state.pet.active && (
          <div className="absolute right-4 bottom-4 text-3xl z-10">
            {getPetIcon(state.pet.active)}
          </div>
        )}
      </div>

      {/* Player Panel */}
      <div className="bg-popover border-t-2 border-black p-3 flex flex-col gap-2 shrink-0">
        {/* Level & Zeny */}
        <div className="flex justify-between text-xs">
          <span className="font-bold">Lv <span className="text-secondary" data-testid="text-hero-lv">{hero.lv}</span></span>
          <span className="font-bold text-yellow-400" data-testid="text-hero-zeny">💰 {hero.zeny.toLocaleString()}</span>
        </div>

        {/* Bars */}
        <div className="flex flex-col gap-1">
          <Bar label="HP" current={Math.floor(hero.hp)} max={stats.maxHp} color="#8b0000" testId="bar-hp" />
          <Bar label="MP" current={Math.floor(hero.mp)} max={stats.maxMp} color="#0044aa" testId="bar-mp" />
          <Bar label="XP" current={hero.exp} max={hero.nextExp} color="#1a3a5c" testId="bar-xp" />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-1 text-[10px]">
          {[
            { k: 'ATK', v: stats.atk },
            { k: 'MATK', v: stats.matk },
            { k: 'DEF', v: stats.def },
            { k: 'FLEE', v: stats.flee },
            { k: 'HIT', v: stats.hit },
            { k: 'CRIT', v: stats.cri.toFixed(1) },
          ].map(s => (
            <div key={s.k} className="bg-card rounded px-1 py-0.5 text-center border border-black">
              <div className="text-muted-foreground">{s.k}</div>
              <div className="font-bold text-secondary">{s.v}</div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            className="flex-1 py-2 border-2 border-black rounded font-bold text-xs uppercase cursor-pointer active:translate-y-px transition-transform"
            style={{ background: '#c1440e', color: 'white' }}
            onClick={() => dispatch({ type: 'MANUAL_ATTACK' })}
            data-testid="button-attack"
          >
            ⚔️ ATACAR
          </button>
          <button
            className={`px-3 py-2 border-2 border-black rounded font-bold text-xs uppercase cursor-pointer transition-all ${settings.autoAttackOn ? 'bg-green-700 text-white' : 'bg-popover text-muted-foreground'}`}
            onClick={() => dispatch({ type: 'TOGGLE_AUTO' })}
            data-testid="button-auto"
          >
            🤖 AUTO
          </button>
        </div>

        {/* Skill bar */}
        <div className="flex gap-1">
          {skills.equipped.map((skillId, i) => {
            const skill = skillId ? skillsDB[skillId] : null;
            const cdEnd = skillId ? (skillCooldowns[skillId] || 0) : 0;
            const cdRemaining = cdEnd > now ? cdEnd - now : 0;
            const cdPct = skill && cdRemaining > 0 ? (cdRemaining / (skill.cooldown * 1000)) * 100 : 0;

            return (
              <div
                key={i}
                className="flex-1 h-10 border-2 border-black rounded relative flex items-center justify-center text-lg cursor-pointer overflow-hidden bg-card"
                style={{ cursor: skill ? 'pointer' : 'default' }}
                title={skill ? `${skill.name} (${skill.mpCost} MP)` : 'Vazio'}
                onClick={() => skill && dispatch({ type: 'USE_SKILL', index: i })}
                data-testid={`skill-slot-${i}`}
              >
                {skill ? (
                  <>
                    <span>{skill.icon}</span>
                    {cdPct > 0 && (
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-black/70"
                        style={{ height: `${cdPct}%`, transition: 'height 0.1s' }}
                      />
                    )}
                  </>
                ) : (
                  <span className="text-muted-foreground text-xs">–</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

function Bar({ label, current, max, color, testId }: { label: string; current: number; max: number; color: string; testId?: string }) {
  const pct = max > 0 ? Math.min(100, (current / max) * 100) : 0;
  return (
    <div className="flex items-center gap-1">
      <span className="text-[9px] text-muted-foreground w-5 shrink-0">{label}</span>
      <div className="flex-1 h-2.5 bg-black border border-black/50 rounded overflow-hidden">
        <div className="h-full transition-all duration-200" style={{ width: `${pct}%`, backgroundColor: color }} data-testid={testId} />
      </div>
      <span className="text-[9px] text-muted-foreground shrink-0">{current}/{max}</span>
    </div>
  );
}

function getElementColor(element: string): string {
  const colors: Record<string, string> = {
    Fogo: '#e74c3c', Água: '#3498db', Terra: '#8b6914', Vento: '#27ae60',
    Luz: '#f1c40f', Trevas: '#9b59b6', Neutro: '#aaa',
  };
  return colors[element] || '#aaa';
}

function getPetIcon(petId: string | null): string {
  if (!petId) return '';
  const p = petsDB.find((x) => x.id === petId);
  return p?.icon || '';
}
