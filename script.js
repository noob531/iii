/**
 * ARCHI·FORUM 2026 - 건축디자인 포럼 인터랙티브 스크립트
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMobileMenu();
  initScrollSpy();
  initShowcaseFilter();
  initShowcaseLikes();
  initDiscussionBoard();
});

/* ==========================================================================
   1. 테마 토글 (다크 모드 / 라이트 모드)
   ========================================================================== */
function initThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  if (!themeToggle) return;

  const currentTheme = localStorage.getItem('archi_theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    updateThemeIcon(true);
  }

  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('archi_theme', 'light');
      updateThemeIcon(false);
      showToast('라이트 모드로 전환되었습니다.', 'fa-sun');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('archi_theme', 'dark');
      updateThemeIcon(true);
      showToast('다크 모드로 전환되었습니다.', 'fa-moon');
    }
  });

  function updateThemeIcon(isDark) {
    const icon = themeToggle.querySelector('i');
    if (icon) {
      icon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
  }
}

/* ==========================================================================
   2. 모바일 내비게이션 메뉴
   ========================================================================== */
function initMobileMenu() {
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('navMenu');
  if (!mobileBtn || !navMenu) return;

  mobileBtn.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    const icon = mobileBtn.querySelector('i');
    if (icon) {
      icon.className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
    }
  });

  // 메뉴 링크 클릭 시 닫기
  navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      const icon = mobileBtn.querySelector('i');
      if (icon) icon.className = 'fa-solid fa-bars';
    });
  });

  // 외부 클릭 시 닫기
  document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !mobileBtn.contains(e.target) && navMenu.classList.contains('open')) {
      navMenu.classList.remove('open');
      const icon = mobileBtn.querySelector('i');
      if (icon) icon.className = 'fa-solid fa-bars';
    }
  });
}

/* ==========================================================================
   3. 스크롤 스파이 (Active Nav Link) - index.html
   ========================================================================== */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 140;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
          }
        });
      }
    });
  });
}

/* ==========================================================================
   4. 프로젝트 쇼케이스 필터링 - index.html
   ========================================================================== */
function initShowcaseFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.showcase-card');
  if (!filterBtns.length || !cards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      cards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.35s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   5. 쇼케이스 카드 좋아요 인터랙션
   ========================================================================== */
function initShowcaseLikes() {
  const likeBtns = document.querySelectorAll('.like-btn');
  likeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const countSpan = btn.querySelector('.like-count');
      const isLiked = btn.classList.toggle('liked');
      let count = parseInt(countSpan.textContent, 10) || 0;

      if (isLiked) {
        count += 1;
        btn.querySelector('i').className = 'fa-solid fa-heart';
        showToast('관심 프로젝트에 저장되었습니다.', 'fa-heart');
      } else {
        count -= 1;
        btn.querySelector('i').className = 'fa-regular fa-heart';
      }
      countSpan.textContent = count;
    });
  });
}

/* ==========================================================================
   6. 건축광장 실시간 아젠다 게시판 (forum.html)
      - 더미/가짜 게시글 완전 삭제
      - 실제 사용자가 작성한 글만 localStorage에 저장 및 표시
   ========================================================================== */
function initDiscussionBoard() {
  const form = document.getElementById('discussionForm');
  const list = document.getElementById('discussionList');
  const countEl = document.getElementById('discussionCount');
  const filterBtns = document.querySelectorAll('.d-filter-btn');
  if (!form || !list || !countEl) return;

  // 실제 사용자가 게시한 글만 로드 (더미 데이터 없음)
  const STORAGE_KEY = 'archi_user_discussions_v2';
  let discussions = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  let currentCategory = 'all';

  function saveDiscussions() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(discussions));
  }

  function renderDiscussions() {
    list.innerHTML = '';
    const filtered = currentCategory === 'all' 
      ? discussions 
      : discussions.filter(item => item.category === currentCategory);

    countEl.textContent = discussions.length;

    // 등록된 글이 없을 때 클린 엠프티 상태 표시
    if (filtered.length === 0) {
      list.innerHTML = `
        <li class="empty-discussion-state">
          <i class="fa-regular fa-comments empty-icon"></i>
          <div class="empty-title">등록된 아젠다 게시글이 없습니다</div>
          <p class="empty-desc">
            ${currentCategory === 'all' 
              ? '상단 폼을 통해 건축 실무, 기술, 정책에 관한 첫 번째 의견을 등록해 보세요!' 
              : `선택하신 [${currentCategory}] 분야에 등록된 게시글이 없습니다.`}
          </p>
        </li>
      `;
      return;
    }

    filtered.forEach(item => {
      const li = document.createElement('li');
      li.className = 'discussion-item';
      li.innerHTML = `
        <div class="discussion-main">
          <div class="discussion-top-meta">
            <span class="discussion-category-badge">${escapeHtml(item.category)}</span>
            <span class="discussion-author"><i class="fa-regular fa-user"></i> ${escapeHtml(item.author)}</span>
            <span class="discussion-time">${escapeHtml(item.time)}</span>
          </div>
          <div class="discussion-text">${escapeHtml(item.title)}</div>
          ${item.content ? `<div class="discussion-detail-text">${escapeHtml(item.content)}</div>` : ''}
        </div>
        <div class="discussion-actions">
          <button class="vote-btn ${item.voted ? 'voted' : ''}" data-id="${item.id}" title="공감 및 추천">
            <i class="fa-solid fa-thumbs-up"></i>
            <span class="vote-count">${item.votes}</span>
          </button>
          <button class="delete-topic-btn" data-id="${item.id}" title="게시글 삭제">
            <i class="fa-regular fa-trash-can"></i>
          </button>
        </div>
      `;

      // 추천 토글 이벤트
      const voteBtn = li.querySelector('.vote-btn');
      voteBtn.addEventListener('click', () => {
        item.voted = !item.voted;
        item.votes += item.voted ? 1 : -1;
        saveDiscussions();
        renderDiscussions();
        if (item.voted) {
          showToast('게시글에 공감하였습니다.', 'fa-thumbs-up');
        }
      });

      // 삭제 이벤트
      const deleteBtn = li.querySelector('.delete-topic-btn');
      deleteBtn.addEventListener('click', () => {
        if (confirm('이 아젠다 게시글을 삭제하시겠습니까?')) {
          discussions = discussions.filter(d => d.id !== item.id);
          saveDiscussions();
          renderDiscussions();
          showToast('게시글이 삭제되었습니다.', 'fa-trash-can');
        }
      });

      list.appendChild(li);
    });
  }

  // 폼 등록 이벤트
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const category = document.getElementById('topicCategory').value;
    const author = document.getElementById('authorInput').value.trim();
    const topic = document.getElementById('topicInput').value.trim();
    const content = document.getElementById('contentInput') ? document.getElementById('contentInput').value.trim() : '';

    if (!topic || !author) {
      showToast('작성자명과 주제를 입력해주세요.', 'fa-circle-exclamation');
      return;
    }

    const now = new Date();
    const timeString = `${now.getMonth() + 1}월 ${now.getDate()}일 ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newDiscussion = {
      id: Date.now(),
      category: category,
      author: author,
      title: topic,
      content: content,
      time: timeString,
      votes: 1,
      voted: true
    };

    discussions.unshift(newDiscussion);
    saveDiscussions();
    form.reset();
    renderDiscussions();
    showToast('새로운 건축 아젠다가 성공적으로 등록되었습니다!', 'fa-circle-check');
  });

  // 카테고리 필터링 탭
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-dfilter');
      renderDiscussions();
    });
  });

  // 초기 렌더링
  renderDiscussions();
}

/* ==========================================================================
   7. 유틸리티 함수 (XSS 방지 & 토스트)
   ========================================================================== */
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showToast(message, iconClass = 'fa-circle-info', duration = 3000) {
  const toast = document.getElementById('toastNotification');
  if (!toast) return;

  toast.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span>${message}</span>`;
  toast.classList.add('show');

  if (window.toastTimeout) {
    clearTimeout(window.toastTimeout);
  }

  window.toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}
