// Shorts Cleaner — 유튜브 쇼츠 제거기 v1.0.0
// 목적: Shorts 관련 섹션/카드/링크를 최대한 조기에 숨기고, 동적으로 생성되는 노드도 지속적으로 제거.
(function () {
  'use strict';

  // 제거 대상 셀렉터들
  const TARGET_SELECTORS = [
    'ytd-reel-shelf-renderer',
    'ytd-reel-video-renderer',
    'ytd-reel-player-overlay-renderer',
    'ytd-shorts',
    'ytd-item-section-renderer ytd-reel-shelf-renderer',
    // 모바일
    'ytm-shorts-lockup-view-model',
    'ytm-shorts-lockup-view-model-v2'
  ];

  // 쇼츠 링크(카드) 감지
  const SHORTS_LINK_SELECTOR = 'a[href^="/shorts"]';

  // 카드 컨테이너 후보들 — 쇼츠 링크가 들어있을 때 상위 카드까지 제거
  const CARD_CONTAINERS = [
    'ytd-rich-item-renderer',
    'ytd-compact-video-renderer',
    'ytd-grid-video-renderer',
    'ytd-video-renderer',
    'ytd-reel-shelf-renderer',
    'ytd-reel-video-renderer',
    // 모바일
    'ytm-shorts-lockup-view-model',
    'ytm-shorts-lockup-view-model-v2',
    'ytm-rich-item-renderer',
    'ytm-item'
  ];

  const REMOVED_ATTR = 'data-shorts-cleaner-removed';

  function closestCard(el) {
    for (const sel of CARD_CONTAINERS) {
      const found = el.closest(sel);
      if (found) return found;
    }
    return null;
  }

  function removeNode(el) {
    if (!el || el.hasAttribute(REMOVED_ATTR)) return;
    el.setAttribute(REMOVED_ATTR, '');
    if (typeof el.remove === 'function') el.remove();
    else if (el.parentNode) el.parentNode.removeChild(el);
  }

  function purgeShortsOnce() {
    let removed = 0;

    // 1) 명시적 컨테이너 제거
    for (const sel of TARGET_SELECTORS) {
      document.querySelectorAll(sel).forEach(el => {
        if (!el.hasAttribute(REMOVED_ATTR)) {
          removeNode(el);
          removed++;
        }
      });
    }

    // 2) Shorts 링크가 포함된 카드 제거
    document.querySelectorAll(SHORTS_LINK_SELECTOR).forEach(a => {
      const card = closestCard(a) || a;
      if (card && !card.hasAttribute(REMOVED_ATTR)) {
        removeNode(card);
        removed++;
      }
    });

    return removed;
  }

  // 초기 시도
  purgeShortsOnce();

  // 네비게이션 이벤트들 — SPA 전환에 대응
  const recheck = () => { purgeShortsOnce(); };
  window.addEventListener('yt-navigate-start', recheck, { passive: true });
  window.addEventListener('yt-navigate-finish', recheck, { passive: true });
  window.addEventListener('yt-page-data-updated', recheck, { passive: true });
  window.addEventListener('spfdone', recheck, { passive: true }); // 구형

  // MutationObserver로 동적 생성 대응
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if ((m.addedNodes && m.addedNodes.length) || (m.type === 'attributes' && m.attributeName === 'href')) {
        purgeShortsOnce();
        break;
      }
    }
  });
  observer.observe(document.documentElement || document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['href']
  });

  // 폴백: 초기 로딩/느린 케이스 대비 30초 한정 폴링
  let tries = 0;
  const maxTries = 60; // 60 * 500ms = 30s
  const timer = setInterval(() => {
    if (purgeShortsOnce() === 0 && tries++ >= maxTries) {
      clearInterval(timer);
    }
  }, 500);
})();
