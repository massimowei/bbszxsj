'use client';

import React, { useEffect, useState } from 'react';
import ActionButton from './components/ActionButton';
import Field from './components/Field';
import StatusNote from './components/StatusNote';
import ConfirmDialog from './components/ConfirmDialog';
import ImageUpload from './components/ImageUpload';
import TinyEditor from './components/TinyEditor';
import { inputStyle, textareaStyle, tagStyle, sideCardStyle } from './styles';

const EMPTY_ANNOUNCEMENT = {
  id: null,
  title: '',
  content: '',
  type: 'info',
  cover_image: '',
  is_active: true,
  sort_order: '',
};

function formatAnnouncement(ann) {
  const base = ann || EMPTY_ANNOUNCEMENT;
  return {
    id: base.id ?? null,
    title: base.title ?? '',
    content: base.content ?? '',
    type: base.type ?? 'info',
    cover_image: base.cover_image ?? '',
    is_active: base.is_active !== false,
    sort_order: base.sort_order ?? '',
  };
}

const TYPE_OPTIONS = [
  { value: 'info', label: '通知', color: '#5f7f67' },
  { value: 'warning', label: '提醒', color: '#c04a1a' },
  { value: 'update', label: '更新', color: '#4a7fb5' },
  { value: 'event', label: '活动', color: '#d4883a' },
  { value: 'interpretation', label: '解读', color: '#8b6914' },
];

const TYPE_META = {
  info: { label: '通知', color: '#5f7f67' },
  warning: { label: '提醒', color: '#c04a1a' },
  update: { label: '更新', color: '#4a7fb5' },
  event: { label: '活动', color: '#d4883a' },
  interpretation: { label: '解读', color: '#8b6914' },
};

export default function AnnouncementManager() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentAnn, setCurrentAnn] = useState(formatAnnouncement(null));
  const [statusNote, setStatusNote] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (!statusNote) return undefined;
    const timer = window.setTimeout(() => setStatusNote(null), 3000);
    return () => window.clearTimeout(timer);
  }, [statusNote]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/announcements?active=false');
      const data = await res.json();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch announcements', error);
      setStatusNote({ type: 'error', text: '公告列表读取失败。' });
    } finally {
      setLoading(false);
    }
  };

  const openEditor = (ann = null) => {
    setCurrentAnn(formatAnnouncement(ann));
    setIsEditing(true);
    setStatusNote(null);
  };

  const closeEditor = () => {
    setIsEditing(false);
    setCurrentAnn(formatAnnouncement(null));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const url = currentAnn.id ? `/api/announcements/${currentAnn.id}` : '/api/announcements';
      const method = currentAnn.id ? 'PUT' : 'POST';
      const payload = {
        ...currentAnn,
        sort_order: currentAnn.sort_order === '' ? null : Number(currentAnn.sort_order),
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let message = '保存失败。';
        try { const data = await res.json(); if (data?.error) message = data.error; } catch {}
        setStatusNote({ type: 'error', text: message });
        return;
      }

      await fetchAnnouncements();
      closeEditor();
      setStatusNote({ type: 'success', text: currentAnn.id ? '公告已更新。' : '新公告已发布。' });
    } catch (error) {
      console.error('Save announcement error', error);
      setStatusNote({ type: 'error', text: '保存时发生错误。' });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (ann) => {
    setActionId(ann.id);
    try {
      const res = await fetch(`/api/announcements/${ann.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !ann.is_active }),
      });
      if (!res.ok) {
        setStatusNote({ type: 'error', text: '操作失败。' });
        return;
      }
      await fetchAnnouncements();
      setStatusNote({ type: 'success', text: ann.is_active ? '公告已隐藏。' : '公告已启用。' });
    } catch (error) {
      console.error('Toggle active error', error);
      setStatusNote({ type: 'error', text: '操作时发生错误。' });
    } finally {
      setActionId(null);
    }
  };

  const requestDelete = (ann) => setPendingDelete(ann);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/announcements/${pendingDelete.id}`, { method: 'DELETE' });
      if (!res.ok) {
        setStatusNote({ type: 'error', text: '删除失败。' });
        return;
      }
      await fetchAnnouncements();
      setStatusNote({ type: 'success', text: '公告已删除。' });
      setPendingDelete(null);
    } catch (error) {
      console.error('Delete announcement error', error);
      setStatusNote({ type: 'error', text: '删除时发生错误。' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const isInterpretation = currentAnn.type === 'interpretation';

  return (
    <section style={{ display: 'grid', gap: '18px' }}>
      <div>
        <div style={{ fontSize: '12px', letterSpacing: '0.08em', color: '#8a7d70', marginBottom: '8px' }}>
          公告管理
        </div>
        <h2 style={{ fontSize: '28px', marginBottom: '6px' }}>公告栏</h2>
        <p style={{ margin: 0, color: '#6f665d', lineHeight: 1.9 }}>
          管理首页公告栏和「官方公告解读」专区。选择「解读」类型将在首页以卡片样式展示，可配封面图。
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {isEditing ? (
          <ActionButton variant="secondary" onClick={closeEditor}>返回列表</ActionButton>
        ) : (
          <>
            <ActionButton variant="primary" onClick={() => openEditor()}>新建公告</ActionButton>
            <ActionButton variant="ghost" onClick={() => openEditor({ ...EMPTY_ANNOUNCEMENT, type: 'interpretation' })}>新建解读</ActionButton>
          </>
        )}
      </div>

      <StatusNote note={statusNote} />

      {isEditing ? (
        <form onSubmit={handleSave} style={{ background: '#fbfaf7', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', display: 'grid', gap: '24px' }}>
          <div style={{ display: 'grid', gap: '10px' }}>
            <div style={{ fontSize: '12px', letterSpacing: '0.08em', color: '#8a7d70' }}>
              {currentAnn.id ? '编辑' : '新建'} · {isInterpretation ? '官方公告解读' : '常规公告'}
            </div>
            <h2 style={{ fontSize: '30px', lineHeight: 1.4, marginBottom: 0 }}>
              {currentAnn.id ? '修改内容' : isInterpretation ? '发布官方公告解读' : '发布新公告'}
            </h2>
          </div>

          <div style={{ display: 'grid', gap: '18px' }}>
            <Field label="标题" hint={isInterpretation ? '解读标题，如「S4赛季更新要点解读」。' : '公告栏显示的主标题，尽量简短有力。'}>
              <input required value={currentAnn.title} onChange={(e) => setCurrentAnn({ ...currentAnn, title: e.target.value })} style={inputStyle} />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <Field label="类型" hint="「解读」类型在首页有专属卡片展示区。">
                <select value={currentAnn.type} onChange={(e) => setCurrentAnn({ ...currentAnn, type: e.target.value })} style={{ ...inputStyle, padding: '0 10px' }}>
                  {TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="排序值" hint="数字越小越靠前。">
                <input type="number" value={currentAnn.sort_order} onChange={(e) => setCurrentAnn({ ...currentAnn, sort_order: e.target.value })} placeholder="例如：10" style={inputStyle} />
              </Field>
            </div>

            {/* Cover image — only shown for interpretation type */}
            {isInterpretation ? (
              <Field label="封面图" hint="解读卡片封面。可粘贴 URL 或拖拽上传。">
                <ImageUpload
                  value={currentAnn.cover_image}
                  onChange={(url) => setCurrentAnn({ ...currentAnn, cover_image: url })}
                />
              </Field>
            ) : null}

            <Field label="内容" hint={isInterpretation ? '解读正文，支持富文本排版和图片上传。首页卡片会截断显示。' : '可选，支持富文本排版。'}>
              <TinyEditor
                value={currentAnn.content}
                onChange={(html) => setCurrentAnn({ ...currentAnn, content: html })}
                placeholder={isInterpretation ? '开始撰写解读正文...' : '开始撰写公告正文...'}
              />
            </Field>

            <Field label="启用状态">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={currentAnn.is_active} onChange={(e) => setCurrentAnn({ ...currentAnn, is_active: e.target.checked })} />
                <span style={{ fontSize: '14px', color: '#666' }}>启用（首页可见）</span>
              </label>
            </Field>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <ActionButton type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? '保存中...' : currentAnn.id ? '保存修改' : isInterpretation ? '发布解读' : '发布公告'}
            </ActionButton>
            <ActionButton type="button" variant="secondary" onClick={closeEditor} disabled={isSaving}>取消</ActionButton>
          </div>
        </form>
      ) : loading ? (
        <div style={{ padding: '44px 0', textAlign: 'center', color: '#746b62' }}>加载中...</div>
      ) : announcements.length === 0 ? (
        <div style={{ ...sideCardStyle, textAlign: 'center', padding: '36px 24px' }}>暂无公告。点击「新建公告」或「新建解读」开始。</div>
      ) : (
        <div style={{ display: 'grid', gap: '14px' }}>
          {announcements.map((ann) => {
            const meta = TYPE_META[ann.type] || TYPE_META.info;
            const isInterp = ann.type === 'interpretation';
            return (
              <article key={ann.id} style={{ background: '#fbfaf7', border: `1px solid ${isInterp ? '#8b6914' : 'var(--border)'}`, borderRadius: '16px', padding: '20px 22px', display: 'grid', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                      <span style={{ ...tagStyle, background: meta.color, color: '#fff' }}>{meta.label}</span>
                      {ann.is_active ? <span style={tagStyle}>启用</span> : <span style={{ ...tagStyle, background: '#e0dcd5' }}>隐藏</span>}
                    </div>
                    <h3 style={{ fontSize: '22px', lineHeight: 1.45, marginBottom: '6px' }}>{ann.title}</h3>
                    {ann.content ? <p style={{ margin: 0, color: '#6f665d', lineHeight: 1.8, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{ann.content}</p> : null}
                    {ann.cover_image ? <div style={{ marginTop: '8px', fontSize: '12px', color: '#8a7d70' }}>封面图：{ann.cover_image}</div> : null}
                    <div style={{ marginTop: '8px', color: '#8a7d70', fontSize: '12px' }}>
                      发布时间：{new Date(ann.created_at).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <ActionButton variant="ghost" onClick={() => toggleActive(ann)} disabled={actionId === ann.id}>
                      {ann.is_active ? '隐藏' : '启用'}
                    </ActionButton>
                    <ActionButton variant="secondary" onClick={() => openEditor(ann)}>编辑</ActionButton>
                    <ActionButton variant="danger" onClick={() => requestDelete(ann)}>删除</ActionButton>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        title="确认删除公告"
        message={`确定删除「${pendingDelete?.title || ''}」吗？此操作不可撤销。`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
      />
    </section>
  );
}
