'use client';

import React, { useEffect, useState, useCallback } from 'react';
import ActionButton from './components/ActionButton';
import Field from './components/Field';
import StatusNote from './components/StatusNote';
import ConfirmDialog from './components/ConfirmDialog';
import ImageUpload from './components/ImageUpload';
import {
  inputStyle,
  textareaStyle,
  toggleRowStyle,
  sideCardStyle,
  sideEyebrowStyle,
  tagStyle,
} from './styles';

const EMPTY_EVENT = {
  id: null,
  title: '',
  description: '',
  category: 'daily',
  reset_type: 'daily',
  reset_day: 1,
  start_date: '',
  end_date: '',
  reward: '',
  difficulty: '',
  cover_image: '',
  is_active: true,
  sort_order: '',
  version: 'current',
};

const CATEGORY_OPTIONS = [
  { value: 'daily', label: '日常活动' },
  { value: 'weekly', label: '周常活动' },
  { value: 'event', label: '限时活动' },
  { value: 'dungeon', label: '副本挑战' },
  { value: 'boss', label: '世界首领' },
];

const RESET_TYPE_OPTIONS = [
  { value: 'daily', label: '每日重置' },
  { value: 'weekly', label: '每周重置' },
  { value: 'none', label: '不重置（永久）' },
];

const RESET_DAY_OPTIONS = [
  { value: 0, label: '周日' },
  { value: 1, label: '周一' },
  { value: 2, label: '周二' },
  { value: 3, label: '周三' },
  { value: 4, label: '周四' },
  { value: 5, label: '周五' },
  { value: 6, label: '周六' },
];

function formatEvent(event) {
  const src = event || EMPTY_EVENT;
  return {
    id: src.id ?? null,
    title: src.title ?? '',
    description: src.description ?? '',
    category: src.category ?? 'daily',
    reset_type: src.reset_type ?? 'daily',
    reset_day: src.reset_day ?? 1,
    start_date: src.start_date ? String(src.start_date).slice(0, 10) : '',
    end_date: src.end_date ? String(src.end_date).slice(0, 10) : '',
    reward: src.reward ?? '',
    difficulty: src.difficulty ?? '',
    cover_image: src.cover_image ?? '',
    is_active: src.is_active !== false,
    sort_order: src.sort_order ?? '',
    version: src.version ?? 'current',
  };
}

export default function EventManager() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusNote, setStatusNote] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionEventId, setActionEventId] = useState(null);
  const [currentEvent, setCurrentEvent] = useState(EMPTY_EVENT);
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (!statusNote) return undefined;
    const timer = window.setTimeout(() => setStatusNote(null), 3000);
    return () => window.clearTimeout(timer);
  }, [statusNote]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/events?all=true');
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch events', error);
      setStatusNote({ type: 'error', text: '活动列表读取失败，请稍后刷新重试。' });
    } finally {
      setLoading(false);
    }
  };

  const openEditor = (event = null) => {
    setCurrentEvent(formatEvent(event));
    setIsEditing(true);
    setStatusNote(null);
  };

  const closeEditor = () => {
    setIsEditing(false);
    setCurrentEvent(EMPTY_EVENT);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const url = currentEvent.id ? `/api/events/${currentEvent.id}` : '/api/events';
      const method = currentEvent.id ? 'PUT' : 'POST';
      const parsedSortOrder = Number(currentEvent.sort_order);
      const payload = {
        ...currentEvent,
        start_date: currentEvent.start_date || null,
        end_date: currentEvent.end_date || null,
        reset_day: Number(currentEvent.reset_day) || 1,
        sort_order:
          currentEvent.sort_order === '' || Number.isNaN(parsedSortOrder) ? null : parsedSortOrder,
        is_active: Boolean(currentEvent.is_active),
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let message = '保存失败，请稍后再试。';
        try {
          const data = await res.json();
          if (data?.error) message = data.error;
        } catch {}
        setStatusNote({ type: 'error', text: `保存失败（${res.status}）：${message}` });
        return;
      }

      await fetchEvents();
      closeEditor();
      setStatusNote({
        type: 'success',
        text: currentEvent.id ? '活动已更新。' : '新活动已添加。',
      });
    } catch (error) {
      console.error('Save event error', error);
      setStatusNote({ type: 'error', text: '保存时发生错误，请稍后重试。' });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (event) => {
    setActionEventId(event.id);
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !event.is_active }),
      });
      if (!res.ok) {
        setStatusNote({ type: 'error', text: '操作失败。' });
        return;
      }
      await fetchEvents();
      setStatusNote({ type: 'success', text: event.is_active ? '活动已停用。' : '活动已启用。' });
    } catch (error) {
      console.error('Toggle active error', error);
      setStatusNote({ type: 'error', text: '操作时发生错误。' });
    } finally {
      setActionEventId(null);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/events/${pendingDelete.id}`, { method: 'DELETE' });
      if (!res.ok) {
        setStatusNote({ type: 'error', text: '删除失败。' });
        return;
      }
      await fetchEvents();
      setStatusNote({ type: 'success', text: '活动已删除。' });
      setPendingDelete(null);
    } catch (error) {
      console.error('Delete event error', error);
      setStatusNote({ type: 'error', text: '删除时发生错误。' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const moveEvent = async (event, direction) => {
    const sorted = [...events].sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999) || a.id - b.id);
    const index = sorted.findIndex((item) => item.id === event.id);
    const target = sorted[index + direction];
    if (!target) return;

    setActionEventId(event.id);
    try {
      const fromOrder = event.sort_order ?? index + 1;
      const toOrder = target.sort_order ?? index + 1 + direction;

      const firstRes = await fetch(`/api/events/${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sort_order: toOrder }),
      });
      const secondRes = await fetch(`/api/events/${target.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sort_order: fromOrder }),
      });

      if (!firstRes.ok || !secondRes.ok) {
        setStatusNote({ type: 'error', text: '顺序调整失败。' });
        return;
      }
      await fetchEvents();
      setStatusNote({ type: 'success', text: '活动顺序已更新。' });
    } catch (error) {
      console.error('Move event error', error);
      setStatusNote({ type: 'error', text: '顺序调整时发生错误。' });
    } finally {
      setActionEventId(null);
    }
  };

  const filteredEvents =
    categoryFilter === 'all'
      ? events
      : events.filter((event) => event.category === categoryFilter);

  const categoryLabel = (cat) => {
    const found = CATEGORY_OPTIONS.find((o) => o.value === cat);
    return found ? found.label : cat;
  };

  const resetTypeLabel = (rt) => {
    const found = RESET_TYPE_OPTIONS.find((o) => o.value === rt);
    return found ? found.label : rt;
  };

  return (
    <>
      <StatusNote note={statusNote} />

      {isEditing ? (
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.7fr) minmax(280px, 0.9fr)',
            gap: '24px',
            alignItems: 'start',
          }}
        >
          <form
            onSubmit={handleSave}
            style={{
              background: '#fbfaf7',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '28px',
              display: 'grid',
              gap: '24px',
            }}
          >
            <div style={{ display: 'grid', gap: '10px' }}>
              <div style={{ fontSize: '12px', letterSpacing: '0.08em', color: '#8a7d70' }}>
                {currentEvent.id ? '编辑活动' : '新建活动'}
              </div>
              <h2 style={{ fontSize: '28px', lineHeight: 1.4, marginBottom: 0 }}>
                {currentEvent.id ? '修改活动内容' : '添加新活动'}
              </h2>
            </div>

            <div style={{ display: 'grid', gap: '18px' }}>
              <Field label="活动名称" hint="例如：帮派运镖、万兽岭秘境、周末双倍经验。">
                <input
                  required
                  value={currentEvent.title}
                  onChange={(e) => setCurrentEvent({ ...currentEvent, title: e.target.value })}
                  style={inputStyle}
                  placeholder="例如：帮派运镖"
                />
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <Field label="活动分类" hint="决定在前台日历中的分组位置。">
                  <select
                    value={currentEvent.category}
                    onChange={(e) => setCurrentEvent({ ...currentEvent, category: e.target.value })}
                    style={{ ...inputStyle, padding: '0 10px' }}
                  >
                    {CATEGORY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="重置类型" hint="日常每天重置，周常每周重置，永久不重置。">
                  <select
                    value={currentEvent.reset_type}
                    onChange={(e) => setCurrentEvent({ ...currentEvent, reset_type: e.target.value })}
                    style={{ ...inputStyle, padding: '0 10px' }}
                  >
                    {RESET_TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              {currentEvent.reset_type === 'weekly' ? (
                <Field label="每周重置日" hint="选择活动进度在星期几重置。">
                  <select
                    value={currentEvent.reset_day}
                    onChange={(e) =>
                      setCurrentEvent({ ...currentEvent, reset_day: Number(e.target.value) })
                    }
                    style={{ ...inputStyle, padding: '0 10px', maxWidth: '200px' }}
                  >
                    {RESET_DAY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </Field>
              ) : null}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <Field label="开始日期" hint="可选，活动开始生效的日期。">
                  <input
                    type="date"
                    value={currentEvent.start_date}
                    onChange={(e) => setCurrentEvent({ ...currentEvent, start_date: e.target.value })}
                    style={inputStyle}
                  />
                </Field>
                <Field label="结束日期" hint="可选，活动结束的日期。不填则视为常驻。">
                  <input
                    type="date"
                    value={currentEvent.end_date}
                    onChange={(e) => setCurrentEvent({ ...currentEvent, end_date: e.target.value })}
                    style={inputStyle}
                  />
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <Field label="难度" hint="可选，例如：简单、普通、困难。">
                  <input
                    value={currentEvent.difficulty}
                    onChange={(e) => setCurrentEvent({ ...currentEvent, difficulty: e.target.value })}
                    placeholder="例如：困难"
                    style={inputStyle}
                  />
                </Field>
                <Field label="游戏版本" hint="用于标记活动属于哪个版本，默认 current。">
                  <input
                    value={currentEvent.version}
                    onChange={(e) => setCurrentEvent({ ...currentEvent, version: e.target.value })}
                    placeholder="current"
                    style={inputStyle}
                  />
                </Field>
              </div>

              <Field label="奖励说明" hint="可选，简要描述活动奖励。">
                <input
                  value={currentEvent.reward}
                  onChange={(e) => setCurrentEvent({ ...currentEvent, reward: e.target.value })}
                  placeholder="例如：灵石 x100、经验 x50000"
                  style={inputStyle}
                />
              </Field>

              <Field label="活动描述" hint="详细说明活动规则、参与方式等。">
                <textarea
                  value={currentEvent.description}
                  onChange={(e) => setCurrentEvent({ ...currentEvent, description: e.target.value })}
                  rows={4}
                  style={textareaStyle}
                  placeholder="例如：每日可完成2次，组队参与..."
                />
              </Field>

              <Field label="封面图" hint="活动卡片的配图。可粘贴 URL 或拖拽上传。">
                <ImageUpload
                  value={currentEvent.cover_image}
                  onChange={(url) => setCurrentEvent({ ...currentEvent, cover_image: url })}
                />
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <Field label="排序值" hint="数字越小越靠前，不填自动排到末尾。">
                  <input
                    type="number"
                    value={currentEvent.sort_order}
                    onChange={(e) => setCurrentEvent({ ...currentEvent, sort_order: e.target.value })}
                    placeholder="例如：10"
                    style={inputStyle}
                  />
                </Field>
                <Field label="启用状态" hint="停用后前台不显示该活动。">
                  <label style={toggleRowStyle}>
                    <input
                      type="checkbox"
                      checked={Boolean(currentEvent.is_active)}
                      onChange={(e) =>
                        setCurrentEvent({ ...currentEvent, is_active: e.target.checked })
                      }
                    />
                    <span>{currentEvent.is_active ? '已启用' : '已停用'}</span>
                  </label>
                </Field>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', paddingTop: '4px' }}>
              <ActionButton type="submit" variant="primary" disabled={isSaving}>
                {isSaving ? '保存中...' : currentEvent.id ? '保存修改' : '添加活动'}
              </ActionButton>
              <ActionButton type="button" variant="secondary" onClick={closeEditor} disabled={isSaving}>
                取消
              </ActionButton>
            </div>
          </form>

          <aside style={{ display: 'grid', gap: '16px' }}>
            <div style={sideCardStyle}>
              <div style={sideEyebrowStyle}>当前活动</div>
              <div style={{ fontSize: '20px', lineHeight: 1.5, marginBottom: '10px' }}>
                {currentEvent.title || '未命名活动'}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={tagStyle}>{categoryLabel(currentEvent.category)}</span>
                <span style={tagStyle}>{resetTypeLabel(currentEvent.reset_type)}</span>
                {currentEvent.is_active ? (
                  <span style={tagStyle}>启用</span>
                ) : (
                  <span style={tagStyle}>停用</span>
                )}
                {currentEvent.difficulty ? <span style={tagStyle}>{currentEvent.difficulty}</span> : null}
              </div>
            </div>
          </aside>
        </section>
      ) : (
        <section style={{ display: 'grid', gap: '18px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div style={{ fontSize: '12px', letterSpacing: '0.08em', color: '#8a7d70', marginBottom: '8px' }}>
                活动管理
              </div>
              <h2 style={{ fontSize: '28px', marginBottom: '6px' }}>活动日历</h2>
              <p style={{ margin: 0, color: '#6f665d' }}>
                共 {events.length} 个活动，其中 {events.filter((e) => e.is_active).length} 个启用中。
              </p>
            </div>
            <ActionButton variant="primary" onClick={() => openEditor()}>
              新建活动
            </ActionButton>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              style={{
                ...tagStyle,
                cursor: 'pointer',
                background: categoryFilter === 'all' ? '#5f7f67' : '#fbfaf7',
                color: categoryFilter === 'all' ? '#f9f8f4' : '#5d554d',
                border: categoryFilter === 'all' ? '1px solid #5f7f67' : '1px solid var(--border)',
              }}
            >
              全部
            </button>
            {CATEGORY_OPTIONS.map((o) => {
              const count = events.filter((e) => e.category === o.value).length;
              if (count === 0) return null;
              const active = categoryFilter === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setCategoryFilter(o.value)}
                  style={{
                    ...tagStyle,
                    cursor: 'pointer',
                    background: active ? '#5f7f67' : '#fbfaf7',
                    color: active ? '#f9f8f4' : '#5d554d',
                    border: active ? '1px solid #5f7f67' : '1px solid var(--border)',
                  }}
                >
                  {o.label} ({count})
                </button>
              );
            })}
          </div>

          {loading ? (
            <div style={{ padding: '44px 0', textAlign: 'center', color: '#746b62' }}>加载活动中...</div>
          ) : filteredEvents.length === 0 ? (
            <div style={{ ...sideCardStyle, textAlign: 'center', padding: '36px 24px' }}>
              暂无活动数据。点击「新建活动」添加第一个活动。
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '14px' }}>
              {filteredEvents
                .slice()
                .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999) || a.id - b.id)
                .map((event, index) => (
                  <article
                    key={event.id}
                    style={{
                      background: '#fbfaf7',
                      border: '1px solid var(--border)',
                      borderRadius: '16px',
                      padding: '20px 22px',
                      display: 'grid',
                      gap: '14px',
                      opacity: event.is_active ? 1 : 0.6,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '16px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                          <span style={tagStyle}>{categoryLabel(event.category)}</span>
                          <span style={tagStyle}>{resetTypeLabel(event.reset_type)}</span>
                          {event.reset_type === 'weekly' ? (
                            <span style={tagStyle}>
                              {RESET_DAY_OPTIONS.find((o) => o.value === event.reset_day)?.label || '周一'}重置
                            </span>
                          ) : null}
                          {event.is_active ? null : <span style={tagStyle}>已停用</span>}
                          {event.difficulty ? <span style={tagStyle}>{event.difficulty}</span> : null}
                          <span style={tagStyle}>排序 {event.sort_order ?? index + 1}</span>
                        </div>
                        <h3 style={{ fontSize: '22px', lineHeight: 1.45, marginBottom: '8px' }}>
                          {event.title}
                        </h3>
                        <p style={{ margin: 0, color: '#6f665d', lineHeight: 1.8, fontSize: '14px' }}>
                          {event.description || '暂无描述。'}
                        </p>
                        <div
                          style={{
                            marginTop: '10px',
                            display: 'flex',
                            gap: '10px',
                            flexWrap: 'wrap',
                            fontSize: '12px',
                            color: '#8a7d70',
                          }}
                        >
                          {event.start_date || event.end_date ? (
                            <span>
                              {event.start_date ? String(event.start_date).slice(0, 10).replace(/-/g, '/') : '?'} -{' '}
                              {event.end_date ? String(event.end_date).slice(0, 10).replace(/-/g, '/') : '常驻'}
                            </span>
                          ) : (
                            <span>常驻</span>
                          )}
                          {event.reward ? <span>| 奖励：{event.reward}</span> : null}
                          {event.version && event.version !== 'current' ? (
                            <span>| v{event.version}</span>
                          ) : null}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <ActionButton
                          variant="ghost"
                          onClick={() => moveEvent(event, -1)}
                          disabled={actionEventId === event.id}
                        >
                          上移
                        </ActionButton>
                        <ActionButton
                          variant="ghost"
                          onClick={() => moveEvent(event, 1)}
                          disabled={actionEventId === event.id}
                        >
                          下移
                        </ActionButton>
                        <ActionButton
                          variant="secondary"
                          onClick={() => toggleActive(event)}
                          disabled={actionEventId === event.id}
                        >
                          {event.is_active ? '停用' : '启用'}
                        </ActionButton>
                        <ActionButton variant="secondary" onClick={() => openEditor(event)}>
                          编辑
                        </ActionButton>
                        <ActionButton variant="danger" onClick={() => setPendingDelete(event)}>
                          删除
                        </ActionButton>
                      </div>
                    </div>
                  </article>
                ))}
            </div>
          )}
        </section>
      )}

      <ConfirmDialog
        item={pendingDelete}
        title="确定移除此活动？"
        message={`《${pendingDelete?.title || '未命名活动'}》将从日历中删除，此操作无法撤回。`}
        confirmLabel="确认删除"
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
      />
    </>
  );
}
