'use client';

import React, { useState, useEffect } from 'react';

const FAV_STORAGE_KEY = 'zxsj-favorites';

export default function FavoriteButton({ guideId }) {
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    try {
      const favs = JSON.parse(localStorage.getItem(FAV_STORAGE_KEY) || '[]');
      setIsFav(favs.includes(guideId));
    } catch {}
  }, [guideId]);

  const handleClick = () => {
    try {
      const favs = JSON.parse(localStorage.getItem(FAV_STORAGE_KEY) || '[]');
      const index = favs.indexOf(guideId);
      if (index >= 0) {
        favs.splice(index, 1);
        setIsFav(false);
      } else {
        favs.push(guideId);
        setIsFav(true);
      }
      localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(favs));
    } catch {}
  };

  return (
    <button
      className={`fav-btn ${isFav ? 'fav-active' : ''}`}
      onClick={handleClick}
      title={isFav ? '取消收藏' : '收藏此攻略'}
      style={{ fontSize: '14px', padding: '6px 14px' }}
    >
      {isFav ? '★ 已收藏' : '☆ 收藏'}
    </button>
  );
}
