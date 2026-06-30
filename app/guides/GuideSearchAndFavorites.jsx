'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { IconSearch } from '../components/Icons';

const FAV_STORAGE_KEY = 'zxsj-favorites';

function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAV_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function setFavorites(favs) {
  localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(favs));
}

function isFavorite(guideId) {
  return getFavorites().includes(guideId);
}

function toggleFavorite(guideId) {
  const favs = getFavorites();
  const index = favs.indexOf(guideId);
  if (index >= 0) {
    favs.splice(index, 1);
  } else {
    favs.push(guideId);
  }
  setFavorites(favs);
  return index < 0; // returns true if newly added
}

export default function GuideSearchAndFavorites({ guides }) {
  const [search, setSearch] = useState('');
  const [showFavs, setShowFavs] = useState(false);
  const [favIds, setFavIds] = useState([]);
  const [favGuides, setFavGuides] = useState([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    setFavIds(getFavorites());
  }, []);

  const filteredGuides = guides.filter((guide) => {
    if (showFavs && !favIds.includes(guide.id)) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      guide.title?.toLowerCase().includes(q) ||
      guide.category?.toLowerCase().includes(q) ||
      guide.excerpt?.toLowerCase().includes(q)
    );
  });

  const handleToggleFav = useCallback((guideId) => {
    const added = toggleFavorite(guideId);
    setFavIds(getFavorites());
    return added;
  }, []);

  // When showing favorites tab, get the full guide objects
  useEffect(() => {
    if (showFavs) {
      setFavGuides(guides.filter((g) => favIds.includes(g.id)));
    }
  }, [showFavs, favIds, guides]);

  return (
    <>
      {/* Search Box */}
      <div className="search-box">
        <span className="search-icon"><IconSearch size={18} color="#999" /></span>
        <input
          className="search-input"
          type="text"
          placeholder="搜索攻略标题、分类或简介..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tabs: All / Favorites */}
      <div className="favorites-header">
        <button
          className={`favorites-tab ${!showFavs ? 'active' : ''}`}
          onClick={() => setShowFavs(false)}
        >
          全部 ({guides.length})
        </button>
        <button
          className={`favorites-tab ${showFavs ? 'active' : ''}`}
          onClick={() => setShowFavs(true)}
        >
          ★ 收藏 ({favIds.length})
        </button>
      </div>

      {/* Results */}
      {filteredGuides.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
          {showFavs ? '还没有收藏任何攻略。点击攻略卡片上的 ★ 添加收藏。' : search ? `没有找到匹配「${search}」的攻略。` : '暂无攻略数据。'}
        </div>
      ) : (
        <div className="guides-grid">
          {filteredGuides.map((guide) => (
            <div className="guide-card" key={guide.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="guide-tag">{guide.category} {guide.emoji}</span>
                <button
                  className={`fav-btn ${favIds.includes(guide.id) ? 'fav-active' : ''}`}
                  onClick={() => handleToggleFav(guide.id)}
                  title={favIds.includes(guide.id) ? '取消收藏' : '收藏'}
                >
                  {favIds.includes(guide.id) ? '★' : '☆'}
                </button>
              </div>
              {guide.cover_image ? (
                <div className="guide-cover">
                  <Image
                    src={guide.cover_image}
                    alt={guide.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ) : null}
              <h3 className="guide-title">{guide.title}</h3>
              <p className="guide-excerpt">{guide.excerpt}</p>
              <Link href={`/guides/${guide.id}`} className="guide-link">阅读详情 →</Link>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
