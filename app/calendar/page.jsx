'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Layout from '../components/Layout';
import '../page.css';

const PROFESSIONS = ['青云门', '合欢派', '鬼王宗', '焚香谷', '灵汐阁', '万毒门'];

const CATEGORY_META = {
  daily: { label: '日常活动', desc: '每日重置，记得清完' },
  weekly: { label: '周常活动', desc: '每周重置，优先完成' },
  event: { label: '限时活动', desc: '注意时间，错过不再' },
  dungeon: { label: '副本挑战', desc: '组队挑战，获取奖励' },
  boss: { label: '世界首领', desc: '定时刷新，抢夺首杀' },
};
const CATEGORY_ORDER = ['daily', 'weekly', 'dungeon', 'boss', 'event'];

const RESET_LABELS = {
  daily: '每日重置',
  weekly: '每周重置',
  none: '永久',
};

const CHARS_KEY = 'zxsj_chars';
const SELECTED_KEY = 'zxsj_selected_char';
const COMPLETION_KEY = 'zxsj_completion';

function loadChars() {
  try {
    const raw = localStorage.getItem(CHARS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveChars(chars) {
  localStorage.setItem(CHARS_KEY, JSON.stringify(chars));
}

function loadSelectedChar() {
  return localStorage.getItem(SELECTED_KEY) || '';
}

function saveSelectedChar(charId) {
  if (charId) {
    localStorage.setItem(SELECTED_KEY, charId);
  } else {
    localStorage.removeItem(SELECTED_KEY);
  }
}

function loadCompletion() {
  try {
    const raw = localStorage.getItem(COMPLETION_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCompletion(data) {
  localStorage.setItem(COMPLETION_KEY, JSON.stringify(data));
}

function getTodayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getWeekResetStr(resetDay) {
  const today = new Date();
  const todayDay = today.getDay();
  let diff = (todayDay - resetDay + 7) % 7;
  if (diff < 0) diff += 7;
  const resetDate = new Date(today);
  resetDate.setDate(today.getDate() - diff);
  const y = resetDate.getFullYear();
  const m = String(resetDate.getMonth() + 1).padStart(2, '0');
  const d = String(resetDate.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getResetKey(event) {
  if (event.reset_type === 'daily') {
    return getTodayStr();
  }
  if (event.reset_type === 'weekly') {
    return getWeekResetStr(event.reset_day ?? 1);
  }
  return 'permanent';
}

function getCompletionKey(charId, event) {
  const resetKey = getResetKey(event);
  return `${charId}:${event.id}:${resetKey}`;
}

function isEventCurrentlyActive(event) {
  if (!event.start_date && !event.end_date) return true;
  const today = getTodayStr();
  if (event.start_date && today < event.start_date) return false;
  if (event.end_date && today > event.end_date) return false;
  return true;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return String(dateStr).slice(0, 10).replace(/-/g, '/');
}

function formatDateRange(event) {
  const start = formatDate(event.start_date);
  const end = formatDate(event.end_date);
  if (start && end) return `${start} - ${end}`;
  if (start) return `${start} 起`;
  if (end) return `截至 ${end}`;
  return '常驻';
}

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [chars, setChars] = useState([]);
  const [selectedCharId, setSelectedCharId] = useState('');
  const [completion, setCompletion] = useState({});
  const [showCharForm, setShowCharForm] = useState(false);
  const [newCharName, setNewCharName] = useState('');
  const [newCharProfession, setNewCharProfession] = useState(PROFESSIONS[0]);
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    const loadedChars = loadChars();
    setChars(loadedChars);
    const loadedSelected = loadSelectedChar();
    setSelectedCharId(loadedSelected || (loadedChars.length > 0 ? loadedChars[0].id : ''));
    setCompletion(loadCompletion());

    fetch('/api/events')
      .then((res) => {
        if (!res.ok) throw new Error('加载失败');
        return res.json();
      })
      .then((data) => {
        setEvents(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch events', err);
        setFetchError('活动数据加载失败，请稍后刷新重试。');
        setLoading(false);
      });
  }, []);

  const addChar = () => {
    const name = newCharName.trim();
    if (!name) return;
    const newChar = {
      id: `c${Date.now()}`,
      name,
      profession: newCharProfession,
    };
    const updated = [...chars, newChar];
    setChars(updated);
    saveChars(updated);
    setSelectedCharId(newChar.id);
    saveSelectedChar(newChar.id);
    setNewCharName('');
    setShowCharForm(false);
  };

  const deleteChar = (charId) => {
    if (!window.confirm('确定删除该角色？该角色的完成记录将一并清除。')) return;
    const updated = chars.filter((c) => c.id !== charId);
    setChars(updated);
    saveChars(updated);
    if (selectedCharId === charId) {
      const newId = updated.length > 0 ? updated[0].id : '';
      setSelectedCharId(newId);
      saveSelectedChar(newId);
    }
    const newCompletion = { ...completion };
    for (const key of Object.keys(newCompletion)) {
      if (key.startsWith(`${charId}:`)) {
        delete newCompletion[key];
      }
    }
    setCompletion(newCompletion);
    saveCompletion(newCompletion);
  };

  const selectChar = (charId) => {
    setSelectedCharId(charId);
    saveSelectedChar(charId);
  };

  const toggleComplete = useCallback(
    (event) => {
      if (!selectedCharId) return;
      const key = getCompletionKey(selectedCharId, event);
      const newCompletion = { ...completion };
      if (newCompletion[key]) {
        delete newCompletion[key];
      } else {
        newCompletion[key] = true;
      }
      setCompletion(newCompletion);
      saveCompletion(newCompletion);
    },
    [selectedCharId, completion]
  );

  const isCompleted = useCallback(
    (event) => {
      if (!selectedCharId) return false;
      const key = getCompletionKey(selectedCharId, event);
      return Boolean(completion[key]);
    },
    [selectedCharId, completion]
  );

  const groupedEvents = () => {
    const groups = {};
    for (const cat of CATEGORY_ORDER) {
      groups[cat] = [];
    }
    for (const event of events) {
      const cat = event.category || 'daily';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(event);
    }
    return groups;
  };

  const groups = groupedEvents();
  const visibleCategories = CATEGORY_ORDER.filter((cat) => {
    if (filterCategory !== 'all' && cat !== filterCategory) return false;
    return groups[cat] && groups[cat].length > 0;
  });

  const allFilteredEvents = visibleCategories.flatMap((cat) => groups[cat]);
  const completedCount = allFilteredEvents.filter(isCompleted).length;
  const totalCount = allFilteredEvents.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const selectedChar = chars.find((c) => c.id === selectedCharId);

  const eventCardStyle = (completed, active) => ({
    background: completed ? '#f0ede6' : '#fbfaf7',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    padding: '18px 20px',
    display: 'flex',
    gap: '14px',
    alignItems: 'flex-start',
    opacity: active ? 1 : 0.55,
    transition: 'opacity 0.3s ease, background 0.3s ease',
  });

  const completeBtnStyle = (completed) => ({
    flexShrink: 0,
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: completed ? '2px solid #5f7f67' : '2px solid var(--border)',
    background: completed ? '#5f7f67' : 'transparent',
    color: completed ? '#f9f8f4' : 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    transition: 'all 0.2s ease',
  });

  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: '26px',
    padding: '0 10px',
    borderRadius: '999px',
    border: '1px solid var(--border)',
    fontSize: '12px',
    color: '#5d554d',
    background: '#f7f3ec',
  };

  return (
    <Layout>
      <main className="main-content" style={{ padding: '24px 0 60px' }}>
        {/* Header */}
        <section style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '12px', letterSpacing: '0.08em', color: '#8a7d70', marginBottom: '12px' }}>
            活动日历
          </div>
          <h1 style={{ fontSize: '38px', lineHeight: 1.3, letterSpacing: '0.03em', marginBottom: '12px' }}>
            游戏活动日历
          </h1>
          <p style={{ margin: 0, color: '#6f665d', lineHeight: 1.9 }}>
            查看当前版本全部活动，添加你的角色并逐个标记完成进度。日常每日重置，周常每周重置。
          </p>
        </section>

        {/* Character Bar */}
        <section
          style={{
            background: '#fbfaf7',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '20px 24px',
            marginBottom: '24px',
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ fontSize: '13px', color: '#8a7d70', letterSpacing: '0.05em', flexShrink: 0 }}>
            我的角色
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            {chars.map((char) => {
              const active = char.id === selectedCharId;
              return (
                <div
                  key={char.id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '0 14px',
                    minHeight: '38px',
                    borderRadius: '999px',
                    border: active ? '2px solid #5f7f67' : '1px solid var(--border)',
                    background: active ? '#eef3ee' : '#f7f3ec',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: active ? '#3d5d47' : '#5d554d',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => selectChar(char.id)}
                >
                  <span style={{ fontWeight: active ? 600 : 400 }}>{char.name}</span>
                  <span style={{ fontSize: '12px', color: '#8a7d70' }}>{char.profession}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChar(char.id);
                    }}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: '#b0a89f',
                      cursor: 'pointer',
                      fontSize: '16px',
                      padding: '0 2px',
                      lineHeight: 1,
                    }}
                    title="删除角色"
                  >
                    x
                  </button>
                </div>
              );
            })}
            {!showCharForm ? (
              <button
                type="button"
                onClick={() => setShowCharForm(true)}
                style={{
                  minHeight: '38px',
                  padding: '0 16px',
                  borderRadius: '999px',
                  border: '1px dashed var(--border)',
                  background: 'transparent',
                  color: '#746b62',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                + 添加角色
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={newCharName}
                  onChange={(e) => setNewCharName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addChar();
                    if (e.key === 'Escape') setShowCharForm(false);
                  }}
                  placeholder="角色名"
                  autoFocus
                  style={{
                    minHeight: '38px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: '#fdfcf9',
                    fontSize: '14px',
                    width: '120px',
                  }}
                />
                <select
                  value={newCharProfession}
                  onChange={(e) => setNewCharProfession(e.target.value)}
                  style={{
                    minHeight: '38px',
                    padding: '0 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: '#fdfcf9',
                    fontSize: '14px',
                  }}
                >
                  {PROFESSIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addChar}
                  style={{
                    minHeight: '38px',
                    padding: '0 16px',
                    borderRadius: '8px',
                    border: '1px solid #5f7f67',
                    background: '#5f7f67',
                    color: '#f9f8f4',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  确认
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCharForm(false);
                    setNewCharName('');
                  }}
                  style={{
                    minHeight: '38px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'transparent',
                    color: '#746b62',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  取消
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Progress Bar */}
        {selectedChar && (
          <section
            style={{
              background: '#fbfaf7',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '20px 24px',
              marginBottom: '28px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
              <div style={{ fontSize: '15px', color: 'var(--text)' }}>
                <span style={{ fontWeight: 600 }}>{selectedChar.name}</span>
                <span style={{ color: '#8a7d70', marginLeft: '8px' }}>{selectedChar.profession}</span>
              </div>
              <div style={{ fontSize: '24px', color: 'var(--text)' }}>
                {completedCount}
                <span style={{ fontSize: '14px', color: '#8a7d70' }}> / {totalCount}</span>
                <span style={{ fontSize: '14px', color: '#8a7d70', marginLeft: '8px' }}>({progressPercent}%)</span>
              </div>
            </div>
            <div
              style={{
                width: '100%',
                height: '8px',
                borderRadius: '4px',
                background: '#e6e2da',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  borderRadius: '4px',
                  background: '#5f7f67',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </section>
        )}

        {/* Category Filter */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '28px' }}>
          <button
            type="button"
            onClick={() => setFilterCategory('all')}
            style={{
              ...badgeStyle,
              cursor: 'pointer',
              background: filterCategory === 'all' ? '#5f7f67' : '#fbfaf7',
              color: filterCategory === 'all' ? '#f9f8f4' : '#5d554d',
              border: filterCategory === 'all' ? '1px solid #5f7f67' : '1px solid var(--border)',
            }}
          >
            全部
          </button>
          {CATEGORY_ORDER.map((cat) => {
            const meta = CATEGORY_META[cat];
            if (!meta) return null;
            const count = groups[cat]?.length || 0;
            if (count === 0) return null;
            const active = filterCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                style={{
                  ...badgeStyle,
                  cursor: 'pointer',
                  background: active ? '#5f7f67' : '#fbfaf7',
                  color: active ? '#f9f8f4' : '#5d554d',
                  border: active ? '1px solid #5f7f67' : '1px solid var(--border)',
                }}
              >
                {meta.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Events */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#746b62' }}>加载活动中...</div>
        ) : fetchError ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: '#9d3d21' }}>{fetchError}</div>
        ) : events.length === 0 ? (
          <div
            style={{
              background: '#fbfaf7',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '48px 24px',
              textAlign: 'center',
              color: '#746b62',
            }}
          >
            暂无活动数据。请在后台管理中添加游戏活动。
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '32px' }}>
            {visibleCategories.map((cat) => {
              const meta = CATEGORY_META[cat] || { label: cat, desc: '' };
              const catEvents = groups[cat] || [];
              const catCompleted = catEvents.filter(isCompleted).length;
              const catTotal = catEvents.length;
              const catPercent = catTotal > 0 ? Math.round((catCompleted / catTotal) * 100) : 0;

              return (
                <section key={cat}>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
                      <h2 style={{ fontSize: '24px', marginBottom: 0 }}>{meta.label}</h2>
                      <span style={{ fontSize: '13px', color: '#8a7d70' }}>
                        {catCompleted}/{catTotal} 已完成
                      </span>
                      <span style={{ fontSize: '12px', color: '#b0a89f' }}>{meta.desc}</span>
                    </div>
                    <div
                      style={{
                        marginTop: '8px',
                        width: '100%',
                        height: '4px',
                        borderRadius: '2px',
                        background: '#e6e2da',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${catPercent}%`,
                          height: '100%',
                          background: '#8daa94',
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {catEvents.map((event) => {
                      const completed = isCompleted(event);
                      const active = isEventCurrentlyActive(event);
                      return (
                        <div key={event.id} style={eventCardStyle(completed, active)}>
                          <button
                            type="button"
                            style={completeBtnStyle(completed)}
                            onClick={() => toggleComplete(event)}
                            disabled={!selectedCharId}
                            title={selectedCharId ? (completed ? '取消标记' : '标记完成') : '请先添加角色'}
                          >
                            {completed ? '\u2713' : ''}
                          </button>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '6px', alignItems: 'center' }}>
                              <h3
                                style={{
                                  fontSize: '18px',
                                  margin: 0,
                                  textDecoration: completed ? 'line-through' : 'none',
                                  color: completed ? '#8a7d70' : 'var(--text)',
                                }}
                              >
                                {event.title}
                              </h3>
                              {event.difficulty ? (
                                <span style={badgeStyle}>{event.difficulty}</span>
                              ) : null}
                              {!active ? (
                                <span style={{ ...badgeStyle, color: '#9d3d21', borderColor: '#f0d8cf' }}>
                                  未开放
                                </span>
                              ) : null}
                            </div>
                            {event.description ? (
                              <p
                                style={{
                                  margin: '0 0 8px',
                                  fontSize: '14px',
                                  color: '#6f665d',
                                  lineHeight: 1.7,
                                  textDecoration: completed ? 'line-through' : 'none',
                                }}
                              >
                                {event.description}
                              </p>
                            ) : null}
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: '12px', color: '#8a7d70' }}>
                              <span>{RESET_LABELS[event.reset_type] || event.reset_type}</span>
                              <span style={{ color: '#d0c8be' }}>|</span>
                              <span>{formatDateRange(event)}</span>
                              {event.reward ? (
                                <>
                                  <span style={{ color: '#d0c8be' }}>|</span>
                                  <span>奖励：{event.reward}</span>
                                </>
                              ) : null}
                              {event.version && event.version !== 'current' ? (
                                <>
                                  <span style={{ color: '#d0c8be' }}>|</span>
                                  <span>v{event.version}</span>
                                </>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* No character hint */}
        {!loading && !fetchError && events.length > 0 && !selectedChar && (
          <div
            style={{
              marginTop: '24px',
              padding: '16px 20px',
              background: '#f4f0ea',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              fontSize: '14px',
              color: '#6f665d',
              textAlign: 'center',
            }}
          >
            点击上方「+ 添加角色」创建你的角色，即可开始标记活动完成进度。
          </div>
        )}
      </main>
    </Layout>
  );
}
