'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import '../page.css';
import { checkAuth, login, logout } from './actions';
import MarkdownRenderer from '../guides/[id]/MarkdownRenderer';
import Layout from '../components/Layout';
import ActionButton from './components/ActionButton';
import Field from './components/Field';
import StatusNote from './components/StatusNote';
import ConfirmDialog from './components/ConfirmDialog';
import IconPicker from './components/IconPicker';
import ImageUpload from './components/ImageUpload';
import EventManager from './EventManager';
import AnnouncementManager from './AnnouncementManager';
import {
  inputStyle,
  textareaStyle,
  toggleRowStyle,
  previewBoxStyle,
  sideCardStyle,
  sideEyebrowStyle,
  tagStyle,
} from './styles';

const EMPTY_GUIDE = {
  id: null,
  title: '',
  category: '',
  emoji: '',
  date: '',
  excerpt: '',
  content: '',
  status: 'draft',
  recommend: false,
  sort_order: '',
  cover_image: '',
  banner_image: '',
};

const CONTENT_EXAMPLE = `## 副本概览

- 推荐人数：10 人
- 适合装等：基础毕业后
- 核心目标：先看机制，再看站位

### 视频嵌入
<iframe src="//player.bilibili.com/player.html?isOutside=true&bvid=BV1gz6QYzE1U&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>

### 注意事项
1. 每段尽量只讲一个重点。
2. 小标题建议按首领或阶段拆分。
3. B 站链接和 iframe 都支持。`;

function formatGuide(guide = EMPTY_GUIDE) {
  return {
    id: guide.id ?? null,
    title: guide.title ?? '',
    category: guide.category ?? '',
    emoji: guide.emoji ?? '',
    date: guide.date ?? '',
    excerpt: guide.excerpt ?? '',
    content: guide.content ?? '',
    status: guide.status === 'published' ? 'published' : 'draft',
    recommend: Boolean(guide.recommend),
    sort_order: guide.sort_order ?? '',
    cover_image: guide.cover_image ?? '',
    banner_image: guide.banner_image ?? '',
  };
}

function getSortOrderValue(value, fallback = Number.MAX_SAFE_INTEGER) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function getGuideDateValue(value) {
  if (!value) return '';
  return String(value).slice(0, 10);
}

export default function AdminPage() {
  const [guides, setGuides] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusNote, setStatusNote] = useState(null);
  const [pendingDeleteGuide, setPendingDeleteGuide] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionGuideId, setActionGuideId] = useState(null);
  const [actionCategoryId, setActionCategoryId] = useState(null);
  const [dragGuideId, setDragGuideId] = useState(null);
  const [viewMode, setViewMode] = useState('guides');
  const [categoryFilter, setCategoryFilter] = useState('全部');
  const [sideTab, setSideTab] = useState('preview');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryEditingId, setCategoryEditingId] = useState(null);
  const [categoryEditingName, setCategoryEditingName] = useState('');
  const [mergeFromId, setMergeFromId] = useState('');
  const [mergeToId, setMergeToId] = useState('');
  const [currentGuide, setCurrentGuide] = useState(EMPTY_GUIDE);

  const categoryNamesFromDb = categories.map((category) => category.name).filter(Boolean);
  const categoryNamesFromGuides = guides.map((guide) => guide.category).filter(Boolean);
  const extraCategoryNames = categoryNamesFromGuides.filter((name) => !categoryNamesFromDb.includes(name));
  const extraCategorySorted = Array.from(new Set(extraCategoryNames)).sort((a, b) => a.localeCompare(b, 'zh-CN'));
  const categoryOptions = [...categoryNamesFromDb, ...extraCategorySorted];
  const guideCountByCategory = guides.reduce((acc, guide) => {
    const key = guide.category || '未分类';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const filteredGuides =
    categoryFilter === '全部' ? guides : guides.filter((guide) => guide.category === categoryFilter);

  useEffect(() => {
    checkAuth().then((isAuth) => {
      setIsAuthenticated(isAuth);
      setAuthLoading(false);
      if (isAuth) {
        fetchGuides();
        fetchCategories();
      }
    });
  }, []);

  useEffect(() => {
    if (!statusNote) return undefined;
    const timer = window.setTimeout(() => setStatusNote(null), 3000);
    return () => window.clearTimeout(timer);
  }, [statusNote]);

  const fetchGuides = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/guides');
      const data = await res.json();
      setGuides(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch guides', error);
      setStatusNote({ type: 'error', text: '攻略列表读取失败，请稍后刷新重试。' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch categories', error);
      setCategories([]);
    }
  };

  const openEditor = (guide = null) => {
    const baseGuide =
      guide || (categoryFilter !== '全部' ? { ...EMPTY_GUIDE, category: categoryFilter } : EMPTY_GUIDE);
    setCurrentGuide(formatGuide(baseGuide));
    setIsEditing(true);
    setSideTab('preview');
    setStatusNote(null);
  };

  const closeEditor = () => {
    setIsEditing(false);
    setCurrentGuide(EMPTY_GUIDE);
  };

  const updateGuideQuickly = async (guideId, patch, successText) => {
    setActionGuideId(guideId);
    try {
      const res = await fetch(`/api/guides/${guideId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });

      if (!res.ok) {
        let message = '操作失败，请稍后再试。';
        try {
          const data = await res.json();
          if (data?.error) message = data.error;
        } catch {
          try {
            const text = await res.text();
            if (text) message = text;
          } catch {}
        }
        setStatusNote({ type: 'error', text: `操作失败（${res.status}）：${message}` });
        return false;
      }

      await fetchGuides();
      if (successText) {
        setStatusNote({ type: 'success', text: successText });
      }
      return true;
    } catch (error) {
      console.error('Quick update error', error);
      setStatusNote({ type: 'error', text: '操作时发生错误，请稍后重试。' });
      return false;
    } finally {
      setActionGuideId(null);
    }
  };

  const togglePinned = async (guide) => {
    const targetPinned = !guide.recommend;
    const targetGroup = guides.filter((item) => Boolean(item.recommend) === targetPinned && item.id !== guide.id);
    const sortOrders = targetGroup.map((item) => getSortOrderValue(item.sort_order)).filter(Number.isFinite);
    const nextSortOrder = targetPinned
      ? (sortOrders.length ? Math.min(...sortOrders) : 1) - 1
      : (sortOrders.length ? Math.max(...sortOrders) : 0) + 1;

    await updateGuideQuickly(
      guide.id,
      { recommend: targetPinned, sort_order: nextSortOrder },
      targetPinned ? `《${guide.title}》已顶置。` : `《${guide.title}》已取消顶置。`
    );
  };

  const moveGuide = async (guide, direction) => {
    const reorderBase = categoryFilter === '全部' ? guides : filteredGuides;
    const sameGroup = reorderBase.filter((item) => Boolean(item.recommend) === Boolean(guide.recommend));
    const currentIndex = sameGroup.findIndex((item) => item.id === guide.id);
    const targetGuide = sameGroup[currentIndex + direction];

    if (!targetGuide) return;

    setActionGuideId(guide.id);
    try {
      const currentOrder = getSortOrderValue(guide.sort_order, currentIndex + 1);
      const targetOrder = getSortOrderValue(targetGuide.sort_order, currentIndex + 1 + direction);

      const firstRes = await fetch(`/api/guides/${guide.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sort_order: targetOrder }),
      });

      const secondRes = await fetch(`/api/guides/${targetGuide.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sort_order: currentOrder }),
      });

      if (!firstRes.ok || !secondRes.ok) {
        setStatusNote({ type: 'error', text: '顺序调整失败，请稍后再试。' });
        return;
      }

      await fetchGuides();
      setStatusNote({ type: 'success', text: `《${guide.title}》的显示顺序已更新。` });
    } catch (error) {
      console.error('Move guide error', error);
      setStatusNote({ type: 'error', text: '顺序调整时发生错误，请稍后重试。' });
    } finally {
      setActionGuideId(null);
    }
  };

  const swapGuideOrder = async (fromId, toId) => {
    if (!fromId || !toId || fromId === toId) return;
    const baseList = categoryFilter === '全部' ? guides : filteredGuides;
    const fromGuide = baseList.find((item) => item.id === fromId);
    const toGuide = baseList.find((item) => item.id === toId);

    if (!fromGuide || !toGuide) return;
    if (Boolean(fromGuide.recommend) !== Boolean(toGuide.recommend)) {
      setStatusNote({ type: 'error', text: '拖拽排序仅在同一组（顶置或普通）内生效。' });
      return;
    }

    setActionGuideId(fromId);
    try {
      const fromOrder = getSortOrderValue(fromGuide.sort_order);
      const toOrder = getSortOrderValue(toGuide.sort_order);

      const firstRes = await fetch(`/api/guides/${fromGuide.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sort_order: toOrder }),
      });

      const secondRes = await fetch(`/api/guides/${toGuide.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sort_order: fromOrder }),
      });

      if (!firstRes.ok || !secondRes.ok) {
        setStatusNote({ type: 'error', text: '拖拽排序失败，请稍后再试。' });
        return;
      }

      await fetchGuides();
      setStatusNote({ type: 'success', text: '显示顺序已更新。' });
    } catch (error) {
      console.error('Swap guide order error', error);
      setStatusNote({ type: 'error', text: '拖拽排序时发生错误。' });
    } finally {
      setActionGuideId(null);
      setDragGuideId(null);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    const res = await login(username, password);
    if (res.success) {
      setIsAuthenticated(true);
      setUsername('');
      setPassword('');
      setStatusNote({ type: 'success', text: '已进入编修后台。' });
      fetchGuides();
    } else {
      setLoginError(res.error);
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsAuthenticated(false);
    setIsEditing(false);
    setGuides([]);
    setStatusNote(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const url = currentGuide.id ? `/api/guides/${currentGuide.id}` : '/api/guides';
      const method = currentGuide.id ? 'PUT' : 'POST';
      const parsedSortOrder = Number(currentGuide.sort_order);
      const payload = {
        ...currentGuide,
        date: getGuideDateValue(currentGuide.date) || null,
        recommend: Boolean(currentGuide.recommend),
        sort_order:
          currentGuide.sort_order === '' || Number.isNaN(parsedSortOrder) ? null : parsedSortOrder,
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
        } catch {
          try {
            const text = await res.text();
            if (text) message = text;
          } catch {}
        }
        setStatusNote({ type: 'error', text: `保存失败（${res.status}）：${message}` });
        return;
      }

      await fetchGuides();
      closeEditor();
      setStatusNote({
        type: 'success',
        text: currentGuide.id ? '攻略内容已更新。' : '新攻略已收录到站内列表。',
      });
    } catch (error) {
      console.error('Save error', error);
      setStatusNote({ type: 'error', text: '保存时发生错误，请稍后重试。' });
    } finally {
      setIsSaving(false);
    }
  };

  const requestDelete = (guide) => {
    setPendingDeleteGuide(guide);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteGuide) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/guides/${pendingDeleteGuide.id}`, { method: 'DELETE' });
      if (!res.ok) {
        let message = '删除失败，请稍后再试。';
        try {
          const data = await res.json();
          if (data?.error) message = data.error;
        } catch {
          try {
            const text = await res.text();
            if (text) message = text;
          } catch {}
        }
        setStatusNote({ type: 'error', text: `删除失败（${res.status}）：${message}` });
        return;
      }
      await fetchGuides();
      setStatusNote({ type: 'success', text: '该篇攻略已从列表中移除。' });
      setPendingDeleteGuide(null);
    } catch (error) {
      console.error('Delete error', error);
      setStatusNote({ type: 'error', text: '删除时发生错误，请稍后重试。' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const createCategory = async () => {
    const name = String(newCategoryName || '').trim();
    if (!name) {
      setStatusNote({ type: 'error', text: '分类名称不能为空。' });
      return;
    }

    setActionCategoryId('create');
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        let message = '新增分类失败。';
        try {
          const data = await res.json();
          if (data?.error) message = data.error;
        } catch {}
        setStatusNote({ type: 'error', text: message });
        return;
      }

      setNewCategoryName('');
      await fetchCategories();
      setStatusNote({ type: 'success', text: '分类已新增。' });
    } catch (error) {
      console.error('Create category error', error);
      setStatusNote({ type: 'error', text: '新增分类时发生错误。' });
    } finally {
      setActionCategoryId(null);
    }
  };

  const startEditCategory = (category) => {
    setCategoryEditingId(category.id);
    setCategoryEditingName(category.name);
  };

  const cancelEditCategory = () => {
    setCategoryEditingId(null);
    setCategoryEditingName('');
  };

  const saveCategory = async (category) => {
    const nextName = String(categoryEditingName || '').trim();
    if (!nextName) {
      setStatusNote({ type: 'error', text: '分类名称不能为空。' });
      return;
    }
    setActionCategoryId(category.id);
    try {
      const res = await fetch(`/api/categories/${category.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nextName, sort_order: category.sort_order }),
      });
      if (!res.ok) {
        let message = '修改分类失败。';
        try {
          const data = await res.json();
          if (data?.error) message = data.error;
        } catch {}
        setStatusNote({ type: 'error', text: message });
        return;
      }
      cancelEditCategory();
      await fetchCategories();
      await fetchGuides();
      setStatusNote({ type: 'success', text: '分类已更新。' });
    } catch (error) {
      console.error('Update category error', error);
      setStatusNote({ type: 'error', text: '修改分类时发生错误。' });
    } finally {
      setActionCategoryId(null);
    }
  };

  const moveCategory = async (category, direction) => {
    const sorted = [...categories].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
    const index = sorted.findIndex((item) => item.id === category.id);
    const target = sorted[index + direction];
    if (!target) return;

    setActionCategoryId(category.id);
    try {
      const firstRes = await fetch(`/api/categories/${category.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: category.name, sort_order: target.sort_order }),
      });
      const secondRes = await fetch(`/api/categories/${target.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: target.name, sort_order: category.sort_order }),
      });
      if (!firstRes.ok || !secondRes.ok) {
        setStatusNote({ type: 'error', text: '分类顺序调整失败。' });
        return;
      }
      await fetchCategories();
      setStatusNote({ type: 'success', text: '分类顺序已更新。' });
    } catch (error) {
      console.error('Move category error', error);
      setStatusNote({ type: 'error', text: '分类顺序调整时发生错误。' });
    } finally {
      setActionCategoryId(null);
    }
  };

  const deleteCategory = async (category) => {
    setActionCategoryId(category.id);
    try {
      const res = await fetch(`/api/categories/${category.id}`, { method: 'DELETE' });
      if (!res.ok) {
        let message = '删除分类失败。';
        try {
          const data = await res.json();
          if (data?.error) message = data.error;
        } catch {}
        setStatusNote({ type: 'error', text: message });
        return;
      }
      await fetchCategories();
      setStatusNote({ type: 'success', text: '分类已删除。' });
    } catch (error) {
      console.error('Delete category error', error);
      setStatusNote({ type: 'error', text: '删除分类时发生错误。' });
    } finally {
      setActionCategoryId(null);
    }
  };

  const mergeCategories = async () => {
    const fromId = Number(mergeFromId);
    const toId = Number(mergeToId);
    if (!Number.isFinite(fromId) || !Number.isFinite(toId) || fromId === toId) {
      setStatusNote({ type: 'error', text: '请选择要合并的两个不同分类。' });
      return;
    }

    setActionCategoryId('merge');
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'merge', fromId, toId }),
      });
      if (!res.ok) {
        let message = '合并失败。';
        try {
          const data = await res.json();
          if (data?.error) message = data.error;
        } catch {}
        setStatusNote({ type: 'error', text: message });
        return;
      }
      setMergeFromId('');
      setMergeToId('');
      await fetchCategories();
      await fetchGuides();
      setStatusNote({ type: 'success', text: '分类已合并。' });
    } catch (error) {
      console.error('Merge category error', error);
      setStatusNote({ type: 'error', text: '合并分类时发生错误。' });
    } finally {
      setActionCategoryId(null);
    }
  };

  return (
    <Layout>
      <main className="main-content" style={{ padding: '24px 0 12px' }}>
        {authLoading ? (
          <div style={{ textAlign: 'center', padding: '100px 0', color: '#746b62' }}>验证身份中...</div>
        ) : !isAuthenticated ? (
          <section
            style={{
              maxWidth: '460px',
              margin: '48px auto 0',
              background: '#fbfaf7',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '32px',
            }}
          >
            <div style={{ fontSize: '12px', letterSpacing: '0.08em', color: '#8a7d70', marginBottom: '12px' }}>
              编修入口
            </div>
            <h1 style={{ fontSize: '32px', lineHeight: 1.35, marginBottom: '12px' }}>后台登录</h1>
            <p style={{ margin: 0, color: '#6f665d', lineHeight: 1.8 }}>
              进入后可整理攻略条目、撰写副本说明，并直接插入 Markdown 或 HTML 内容。
            </p>
            <form onSubmit={handleLogin} style={{ display: 'grid', gap: '18px', marginTop: '28px' }}>
              <Field label="账号">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  style={inputStyle}
                />
              </Field>
              <Field label="密码">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={inputStyle}
                />
              </Field>
              {loginError ? <div style={{ color: '#9d3d21', fontSize: '13px' }}>{loginError}</div> : null}
              <ActionButton type="submit" variant="primary">
                进入后台
              </ActionButton>
            </form>
          </section>
        ) : (
          <>
            <section
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '16px',
                flexWrap: 'wrap',
                marginBottom: '28px',
              }}
            >
              <div style={{ maxWidth: '620px' }}>
                <div style={{ fontSize: '12px', letterSpacing: '0.08em', color: '#8a7d70', marginBottom: '12px' }}>
                  卷宗编修台
                </div>
                <h1
                  style={{
                    fontSize: '38px',
                    lineHeight: 1.3,
                    letterSpacing: '0.03em',
                    marginBottom: '12px',
                  }}
                >
                  后台编写攻略
                </h1>
                <p style={{ margin: 0, color: '#6f665d', lineHeight: 1.9 }}>
                  这里不是传统管理面板，而是一张适合长期整理内容的安静工作台。先维护目录，再进入正文编写。
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {isEditing ? (
                  <ActionButton variant="secondary" onClick={closeEditor}>
                    返回目录
                  </ActionButton>
                ) : viewMode === 'categories' ? (
                  <ActionButton variant="secondary" onClick={() => setViewMode('guides')}>
                    返回攻略目录
                  </ActionButton>
                ) : viewMode === 'events' ? (
                  <ActionButton variant="secondary" onClick={() => setViewMode('guides')}>
                    返回攻略目录
                  </ActionButton>
                ) : viewMode === 'announcements' ? (
                  <ActionButton variant="secondary" onClick={() => setViewMode('guides')}>
                    返回攻略目录
                  </ActionButton>
                ) : (
                  <ActionButton variant="primary" onClick={() => openEditor()}>
                    新建攻略
                  </ActionButton>
                )}
                {!isEditing && viewMode === 'guides' ? (
                  <>
                    <ActionButton variant="ghost" onClick={() => setViewMode('categories')}>
                      分类管理
                    </ActionButton>
                    <ActionButton variant="ghost" onClick={() => setViewMode('events')}>
                      活动日历
                    </ActionButton>
                    <ActionButton variant="ghost" onClick={() => setViewMode('announcements')}>
                      公告管理
                    </ActionButton>
                  </>
                ) : null}
                <ActionButton variant="ghost" onClick={handleLogout}>
                  退出登录
                </ActionButton>
              </div>
            </section>

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
                    gap: '28px',
                  }}
                >
                  <div style={{ display: 'grid', gap: '10px' }}>
                    <div style={{ fontSize: '12px', letterSpacing: '0.08em', color: '#8a7d70' }}>
                      {currentGuide.id ? '内容修订' : '新稿录入'}
                    </div>
                    <h2 style={{ fontSize: '30px', lineHeight: 1.4, marginBottom: 0 }}>
                      {currentGuide.id ? '编辑现有攻略' : '撰写新攻略'}
                    </h2>
                  </div>

                  <div style={{ display: 'grid', gap: '18px' }}>
                    <Field label="标题" hint={'建议直接写成读者能一眼看懂的章节名，例如「副本攻略一站式指南」。'}>
                      <input
                        required
                        value={currentGuide.title}
                        onChange={(e) => setCurrentGuide({ ...currentGuide, title: e.target.value })}
                        style={inputStyle}
                      />
                    </Field>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                      <Field label="分类" hint="例如：副本攻略、职业攻略、配装整理。">
                        <input
                          required
                          list="guide-category-options"
                          value={currentGuide.category}
                          onChange={(e) => setCurrentGuide({ ...currentGuide, category: e.target.value })}
                          placeholder="例如：副本攻略"
                          style={inputStyle}
                        />
                      </Field>
                      <Field label="标记符号" hint="可选，选择一个墨线图标或保留 emoji 短标记。">
                        <IconPicker
                          value={currentGuide.emoji}
                          onChange={(emoji) => setCurrentGuide({ ...currentGuide, emoji })}
                        />
                      </Field>
                    </div>

                    <datalist id="guide-category-options">
                      {categoryOptions.map((category) => (
                        <option key={category} value={category} />
                      ))}
                    </datalist>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                      <Field label="发布日期" hint="不填则默认使用今天，用于详情页显示更新时间。">
                        <input
                          type="date"
                          value={getGuideDateValue(currentGuide.date)}
                          onChange={(e) => setCurrentGuide({ ...currentGuide, date: e.target.value })}
                          style={inputStyle}
                        />
                      </Field>
                      <Field label="顺序值" hint="数字越小越靠前；不填时会自动排到当前列表后方。">
                        <input
                          type="number"
                          value={currentGuide.sort_order}
                          onChange={(e) => setCurrentGuide({ ...currentGuide, sort_order: e.target.value })}
                          placeholder="例如：10"
                          style={inputStyle}
                        />
                      </Field>
                    </div>

                    <Field label="显示设置" hint="顶置内容会优先展示在首页与攻略全集顶部。">
                      <label style={toggleRowStyle}>
                        <input
                          type="checkbox"
                          checked={Boolean(currentGuide.recommend)}
                          onChange={(e) => setCurrentGuide({ ...currentGuide, recommend: e.target.checked })}
                        />
                        <span>设为顶置攻略</span>
                      </label>
                    </Field>

                    <Field label="发布状态" hint="草稿只在后台可见；发布后才会出现在首页与攻略全集。">
                      <select
                        value={currentGuide.status}
                        onChange={(e) => setCurrentGuide({ ...currentGuide, status: e.target.value })}
                        style={{ ...inputStyle, padding: '0 10px' }}
                      >
                        <option value="draft">草稿</option>
                        <option value="published">发布</option>
                      </select>
                    </Field>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                      <Field label="封面图" hint="首页/列表卡片上的图片。可粘贴 URL 或拖拽上传。">
                        <ImageUpload
                          value={currentGuide.cover_image}
                          onChange={(url) => setCurrentGuide({ ...currentGuide, cover_image: url })}
                        />
                      </Field>
                      <Field label="头图" hint="攻略详情页顶部大图。可粘贴 URL 或拖拽上传。">
                        <ImageUpload
                          value={currentGuide.banner_image}
                          onChange={(url) => setCurrentGuide({ ...currentGuide, banner_image: url })}
                        />
                      </Field>
                    </div>

                    <Field label="简介" hint="列表页中显示的摘要，建议控制在 40 到 80 字之间。">
                      <textarea
                        required
                        value={currentGuide.excerpt}
                        onChange={(e) => setCurrentGuide({ ...currentGuide, excerpt: e.target.value })}
                        rows={4}
                        style={textareaStyle}
                      />
                    </Field>

                    <Field
                      label="正文内容"
                      hint="支持 Markdown、小标题、列表、普通 HTML，以及 B 站 iframe 嵌入代码。"
                    >
                      <textarea
                        required
                        value={currentGuide.content}
                        onChange={(e) => setCurrentGuide({ ...currentGuide, content: e.target.value })}
                        rows={18}
                        style={{ ...textareaStyle, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }}
                      />
                    </Field>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', paddingTop: '4px' }}>
                    <ActionButton type="submit" variant="primary" disabled={isSaving}>
                      {isSaving ? '保存中...' : currentGuide.id ? '保存修订' : '收录攻略'}
                    </ActionButton>
                    <ActionButton type="button" variant="secondary" onClick={closeEditor} disabled={isSaving}>
                      暂停编写
                    </ActionButton>
                  </div>
                </form>

                <aside style={{ display: 'grid', gap: '16px' }}>
                  <div style={sideCardStyle}>
                    <div style={sideEyebrowStyle}>当前稿件</div>
                    <div style={{ fontSize: '22px', lineHeight: 1.5, marginBottom: '10px' }}>
                      {currentGuide.title || '未命名稿件'}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={tagStyle}>{currentGuide.category || '待定分类'}</span>
                      <span style={tagStyle}>{currentGuide.id ? '修订中' : '新稿'}</span>
                      {currentGuide.recommend ? <span style={tagStyle}>顶置</span> : null}
                      {currentGuide.status === 'draft' ? <span style={tagStyle}>草稿</span> : <span style={tagStyle}>已发布</span>}
                      <span style={tagStyle}>顺序 {currentGuide.sort_order || '自动'}</span>
                    </div>
                  </div>

                  <div style={sideCardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                      <div style={sideEyebrowStyle}>右侧面板</div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {[
                          { key: 'preview', label: '实时预览' },
                          { key: 'tips', label: '编写提示' },
                          { key: 'example', label: '格式参考' },
                        ].map((item) => {
                          const active = sideTab === item.key;
                          return (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => setSideTab(item.key)}
                              style={{
                                ...tagStyle,
                                cursor: 'pointer',
                                background: active ? '#5f7f67' : '#fbfaf7',
                                color: active ? '#f9f8f4' : '#5d554d',
                                border: active ? '1px solid #5f7f67' : '1px solid var(--border)',
                              }}
                            >
                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {sideTab === 'preview' ? (
                      <div style={{ display: 'grid', gap: '12px' }}>
                        {currentGuide.banner_image ? (
                          <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                            <Image
                              src={currentGuide.banner_image}
                              alt={currentGuide.title || 'banner'}
                              fill
                              sizes="(max-width: 768px) 100vw, 400px"
                              style={{ objectFit: 'cover' }}
                            />
                          </div>
                        ) : currentGuide.cover_image ? (
                          <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                            <Image
                              src={currentGuide.cover_image}
                              alt={currentGuide.title || 'cover'}
                              fill
                              sizes="(max-width: 768px) 100vw, 400px"
                              style={{ objectFit: 'cover' }}
                            />
                          </div>
                        ) : null}
                        <div style={previewBoxStyle}>
                          {currentGuide.content ? (
                            <MarkdownRenderer content={currentGuide.content} />
                          ) : (
                            <div style={{ color: '#8a7d70', fontSize: '13px' }}>开始输入正文后，这里会实时显示预览效果。</div>
                          )}
                        </div>
                      </div>
                    ) : sideTab === 'tips' ? (
                      <ul style={{ margin: 0, paddingLeft: '18px', color: '#6f665d', lineHeight: 1.9 }}>
                        <li>先写副本概览，再拆首领机制、站位和时间轴。</li>
                        <li>每个小标题尽量只承担一个主题，方便读者快速扫读。</li>
                        <li>视频建议放在对应首领段落下，不要一次堆太多。</li>
                      </ul>
                    ) : (
                      <pre
                        style={{
                          margin: 0,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          fontSize: '12px',
                          lineHeight: 1.8,
                          color: '#5d554d',
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                        }}
                      >
                        {CONTENT_EXAMPLE}
                      </pre>
                    )}
                  </div>
                </aside>
              </section>
            ) : viewMode === 'categories' ? (
              <section style={{ display: 'grid', gap: '18px' }}>
                <div>
                  <div style={{ fontSize: '12px', letterSpacing: '0.08em', color: '#8a7d70', marginBottom: '8px' }}>
                    分类管理
                  </div>
                  <h2 style={{ fontSize: '28px', marginBottom: '6px' }}>分类目录</h2>
                  <p style={{ margin: 0, color: '#6f665d', lineHeight: 1.9 }}>
                    这里用于新增、改名、合并分类，并调整分类的显示顺序。
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '14px' }}>
                  <div style={{ ...sideCardStyle, background: '#fbfaf7' }}>
                    <div style={sideEyebrowStyle}>新增分类</div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <input
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="例如：配装整理"
                        style={{ ...inputStyle, flex: 1, minWidth: '220px' }}
                      />
                      <ActionButton variant="primary" onClick={createCategory} disabled={actionCategoryId === 'create'}>
                        新增
                      </ActionButton>
                    </div>
                  </div>

                  <div style={{ ...sideCardStyle, background: '#fbfaf7' }}>
                    <div style={sideEyebrowStyle}>合并分类</div>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      <select
                        value={mergeFromId}
                        onChange={(e) => setMergeFromId(e.target.value)}
                        style={{ ...inputStyle, padding: '0 10px' }}
                      >
                        <option value="">选择要合并的分类</option>
                        {categories
                          .slice()
                          .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id)
                          .map((category) => (
                            <option key={category.id} value={String(category.id)}>
                              {category.name}
                            </option>
                          ))}
                      </select>
                      <select
                        value={mergeToId}
                        onChange={(e) => setMergeToId(e.target.value)}
                        style={{ ...inputStyle, padding: '0 10px' }}
                      >
                        <option value="">选择合并到哪个分类</option>
                        {categories
                          .slice()
                          .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id)
                          .map((category) => (
                            <option key={category.id} value={String(category.id)}>
                              {category.name}
                            </option>
                          ))}
                      </select>
                      <ActionButton variant="secondary" onClick={mergeCategories} disabled={actionCategoryId === 'merge'}>
                        执行合并
                      </ActionButton>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '12px' }}>
                  {categories.length === 0 ? (
                    <div style={{ ...sideCardStyle, textAlign: 'center', padding: '36px 24px' }}>暂无分类。</div>
                  ) : (
                    categories
                      .slice()
                      .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id)
                      .map((category) => {
                        const count = guideCountByCategory[category.name] || 0;
                        const isEditingCategory = categoryEditingId === category.id;
                        const disabled = actionCategoryId === category.id;

                        return (
                          <article
                            key={category.id}
                            style={{
                              background: '#fbfaf7',
                              border: '1px solid var(--border)',
                              borderRadius: '16px',
                              padding: '18px 20px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              gap: '14px',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                            }}
                          >
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                                <span style={tagStyle}>排序 {category.sort_order}</span>
                                <span style={tagStyle}>攻略 {count}</span>
                              </div>
                              {isEditingCategory ? (
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                                  <input
                                    value={categoryEditingName}
                                    onChange={(e) => setCategoryEditingName(e.target.value)}
                                    style={{ ...inputStyle, maxWidth: '360px' }}
                                  />
                                  <ActionButton variant="primary" onClick={() => saveCategory(category)} disabled={disabled}>
                                    保存
                                  </ActionButton>
                                  <ActionButton variant="secondary" onClick={cancelEditCategory} disabled={disabled}>
                                    取消
                                  </ActionButton>
                                </div>
                              ) : (
                                <div style={{ fontSize: '20px', lineHeight: 1.6 }}>{category.name}</div>
                              )}
                            </div>
                            {!isEditingCategory ? (
                              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                <ActionButton variant="ghost" onClick={() => moveCategory(category, -1)} disabled={disabled}>
                                  上移
                                </ActionButton>
                                <ActionButton variant="ghost" onClick={() => moveCategory(category, 1)} disabled={disabled}>
                                  下移
                                </ActionButton>
                                <ActionButton variant="secondary" onClick={() => startEditCategory(category)} disabled={disabled}>
                                  改名
                                </ActionButton>
                                <ActionButton variant="danger" onClick={() => deleteCategory(category)} disabled={disabled}>
                                  删除
                                </ActionButton>
                              </div>
                            ) : null}
                          </article>
                        );
                      })
                  )}
                </div>
              </section>
            ) : viewMode === 'events' ? (
              <EventManager />
            ) : viewMode === 'announcements' ? (
              <AnnouncementManager />
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
                      目录管理
                    </div>
                    <h2 style={{ fontSize: '28px', marginBottom: '6px' }}>攻略列表</h2>
                    <p style={{ margin: 0, color: '#6f665d' }}>
                      已收录 {guides.length} 篇，其中顶置 {guides.filter((guide) => guide.recommend).length} 篇。
                    </p>
                  </div>
                  <ActionButton variant="primary" onClick={() => openEditor()}>
                    新建攻略
                  </ActionButton>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                  <div style={sideCardStyle}>
                    <div style={sideEyebrowStyle}>分类数</div>
                    <div style={{ fontSize: '26px' }}>{categoryNamesFromDb.length}</div>
                    <div style={{ color: '#6f665d', fontSize: '13px', lineHeight: 1.8 }}>便于按专题整理副本、职业与入门内容。</div>
                  </div>
                  <div style={sideCardStyle}>
                    <div style={sideEyebrowStyle}>当前顶置</div>
                    <div style={{ fontSize: '26px' }}>{guides.filter((guide) => guide.recommend).length}</div>
                    <div style={{ color: '#6f665d', fontSize: '13px', lineHeight: 1.8 }}>这些内容会优先出现在站内首页和攻略全集前列。</div>
                  </div>
                  <div style={sideCardStyle}>
                    <div style={sideEyebrowStyle}>当前筛选</div>
                    <div style={{ fontSize: '26px' }}>{filteredGuides.length}</div>
                    <div style={{ color: '#6f665d', fontSize: '13px', lineHeight: 1.8 }}>
                      {categoryFilter === '全部' ? '正在查看全部分类。' : `正在查看"${categoryFilter}"分类。`}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {['全部', ...categoryOptions].map((category) => {
                    const active = categoryFilter === category;
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setCategoryFilter(category)}
                        style={{
                          ...tagStyle,
                          cursor: 'pointer',
                          background: active ? '#5f7f67' : '#fbfaf7',
                          color: active ? '#f9f8f4' : '#5d554d',
                          border: active ? '1px solid #5f7f67' : '1px solid var(--border)',
                        }}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>

                {loading ? (
                  <div style={{ padding: '44px 0', textAlign: 'center', color: '#746b62' }}>目录整理中...</div>
                ) : filteredGuides.length === 0 ? (
                  <div style={{ ...sideCardStyle, textAlign: 'center', padding: '36px 24px' }}>暂无攻略数据。</div>
                ) : (
                  <div style={{ display: 'grid', gap: '14px' }}>
                    {filteredGuides.map((guide, index) => (
                      <article
                        key={guide.id}
                        draggable
                        onDragStart={() => setDragGuideId(guide.id)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => swapGuideOrder(dragGuideId, guide.id)}
                        onDragEnd={() => setDragGuideId(null)}
                        style={{
                          background: '#fbfaf7',
                          border: '1px solid var(--border)',
                          borderRadius: '16px',
                          padding: '20px 22px',
                          display: 'grid',
                          gap: '14px',
                          opacity: dragGuideId === guide.id ? 0.65 : 1,
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
                              <span style={tagStyle}>{guide.category || '未分类'}</span>
                              {guide.emoji ? <span style={tagStyle}>{guide.emoji}</span> : null}
                              {guide.recommend ? <span style={tagStyle}>顶置</span> : null}
                              {guide.status === 'draft' ? <span style={tagStyle}>草稿</span> : null}
                              <span style={tagStyle}>顺序 {guide.sort_order ?? index + 1}</span>
                            </div>
                            <h3 style={{ fontSize: '24px', lineHeight: 1.45, marginBottom: '8px' }}>{guide.title}</h3>
                            <p style={{ margin: 0, color: '#6f665d', lineHeight: 1.8 }}>
                              {guide.excerpt || '暂无简介。'}
                            </p>
                            <div style={{ marginTop: '10px', color: '#8a7d70', fontSize: '12px' }}>
                              更新时间：{getGuideDateValue(guide.date) || '未设置'}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            <ActionButton
                              variant="ghost"
                              onClick={() => moveGuide(guide, -1)}
                              disabled={actionGuideId === guide.id}
                            >
                              上移
                            </ActionButton>
                            <ActionButton
                              variant="ghost"
                              onClick={() => moveGuide(guide, 1)}
                              disabled={actionGuideId === guide.id}
                            >
                              下移
                            </ActionButton>
                            <ActionButton
                              variant="secondary"
                              onClick={() => togglePinned(guide)}
                              disabled={actionGuideId === guide.id}
                            >
                              {guide.recommend ? '取消顶置' : '顶置'}
                            </ActionButton>
                            <ActionButton variant="secondary" onClick={() => openEditor(guide)}>
                              继续编写
                            </ActionButton>
                            <ActionButton variant="danger" onClick={() => requestDelete(guide)}>
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
          </>
        )}
      </main>

      <ConfirmDialog
        guide={pendingDeleteGuide}
        onCancel={() => setPendingDeleteGuide(null)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
      />
    </Layout>
  );
}
