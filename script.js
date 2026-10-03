/* ==========================================================================
   شهاب موسكو | Shehab Moscow — script.js
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* -----------------------------------------------------------------------
     1) Navbar: تبديل الخلفية + الشعار (أبيض فوق الـHero الداكن، أحمر بعده)
        يُستخدم IntersectionObserver على قسم الـHero نفسه بدل عدد بكسلات
        تمرير ثابت، حتى يبقى الشعار الأبيض واضحًا طوال وجود الـHero الداكن
        تمامًا، ويتحول للأحمر بمجرد الدخول إلى الأقسام الفاتحة التالية.
     ----------------------------------------------------------------------- */
  try {
    const navbar = document.getElementById('navbar');
    const hero = document.getElementById('hero');
    if (navbar && hero) {
      const navHeight = navbar.offsetHeight || 80;
      if ('IntersectionObserver' in window) {
        const heroObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            // طالما جزء من الـHero (أسفل ارتفاع الـNavbar) ما زال ظاهرًا، يبقى الشعار أبيض.
            navbar.classList.toggle('is-scrolled', !entry.isIntersecting);
          });
        }, { rootMargin: `-${navHeight}px 0px 0px 0px`, threshold: 0 });
        heroObserver.observe(hero);
      } else {
        // بديل بسيط عند عدم توفر IntersectionObserver
        const setNavbarState = () => {
          navbar.classList.toggle('is-scrolled', window.scrollY > hero.offsetHeight - navHeight);
        };
        setNavbarState();
        window.addEventListener('scroll', setNavbarState, { passive: true });
      }
    } else if (navbar) {
      // صفحة بدون Hero: احتفظ بالسلوك القديم كاحتياط
      const setNavbarState = () => navbar.classList.toggle('is-scrolled', window.scrollY > 40);
      setNavbarState();
      window.addEventListener('scroll', setNavbarState, { passive: true });
    }
  } catch (err) { console.error('Navbar scroll state error:', err); }

  /* -----------------------------------------------------------------------
     2) Hamburger Menu
     ----------------------------------------------------------------------- */
  try {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navbarLinks = document.getElementById('navbarLinks');
    if (hamburgerBtn && navbarLinks) {
      const closeMenu = () => {
        navbarLinks.classList.remove('is-open');
        hamburgerBtn.classList.remove('is-open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      };
      const toggleMenu = () => {
        const isOpen = navbarLinks.classList.toggle('is-open');
        hamburgerBtn.classList.toggle('is-open', isOpen);
        hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
        document.body.style.overflow = isOpen ? 'hidden' : '';
      };
      hamburgerBtn.addEventListener('click', toggleMenu);
      navbarLinks.querySelectorAll('.nav-link').forEach((link) => link.addEventListener('click', closeMenu));
      window.addEventListener('resize', () => { if (window.innerWidth > 760) closeMenu(); });
    }
  } catch (err) { console.error('Hamburger menu error:', err); }

  /* -----------------------------------------------------------------------
     3) Reveal on scroll (fade + translate) — للعناصر النصية والبطاقات فقط.
        ملاحظة: هذه العناصر تبدأ opacity:0 في CSS، لذلك تعتمد على نجاح هذا
        الكود لتظهر. هذا مقبول للنصوص، لكن الصور تُعالج بطريقة مختلفة أدناه
        (لا تُخفى إطلاقًا) بعد المشكلة التي ظهرت سابقًا.
     ----------------------------------------------------------------------- */
  try {
    const revealTargets = document.querySelectorAll(
      '.section-head, .service-row, .package-card, .step-item, .why-text, .why-list, .intro-grid, .services-heading'
    );
    revealTargets.forEach((el) => el.classList.add('reveal'));

    if ('IntersectionObserver' in window) {
      const textObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            textObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
      revealTargets.forEach((el) => textObserver.observe(el));
    } else {
      revealTargets.forEach((el) => el.classList.add('is-visible'));
    }
  } catch (err) { console.error('Text reveal error:', err); }

  /* -----------------------------------------------------------------------
     4) دخول الصور الكبيرة (الجاليري، لوحات النقل)
        الإصلاح: الصورة نفسها مرئية دائمًا (لا opacity:0 ولا clip-path مخفي في
        CSS). الكلاس media-reveal يضيف فقط Scale خفيف (1.08 → 1) كحركة دخول
        اختيارية. إذا فشل هذا الكود بالكامل لأي سبب، الصور تبقى بحجمها الطبيعي
        وظاهرة 100% لأن ذلك هو وضعها الافتراضي في CSS من الأساس.
     ----------------------------------------------------------------------- */
  try {
    const mediaTargets = document.querySelectorAll(
      '.transport-panel-media img'
    );
    mediaTargets.forEach((el) => el.classList.add('media-reveal'));

    if ('IntersectionObserver' in window) {
      const mediaObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            mediaObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
      mediaTargets.forEach((el) => mediaObserver.observe(el));
    } else {
      mediaTargets.forEach((el) => el.classList.add('is-visible'));
    }
  } catch (err) { console.error('Gallery/transport media reveal error:', err); }

  /* -----------------------------------------------------------------------
     4.5) Slider الأنشطة: Autoplay + أسهم + مؤشر رقمي + تكبير الشريحة النشطة
        الأساس (HTML/CSS scroll-snap) يعمل بالفعل بدون هذا الكود عبر السحب
        باللمس أو عجلة الفأرة. كل ما هنا هو تحسين فوق ذلك الأساس فقط:
        لو فشل هذا الكود، يبقى تصفّح الأنشطة يدويًا ممكنًا بالكامل.
     ----------------------------------------------------------------------- */
  try {
    const slider = document.getElementById('activitiesSlider');
    const track = document.getElementById('activitiesTrack');
    if (slider && track) {
      const slides = Array.from(track.querySelectorAll('.activity-slide'));
      const prevBtn = document.getElementById('sliderPrev');
      const nextBtn = document.getElementById('sliderNext');
      const currentEl = document.getElementById('sliderCurrent');
      const totalEl = document.getElementById('sliderTotal');

      if (totalEl) totalEl.textContent = String(slides.length).padStart(2, '0');

      let activeIndex = 0;
      const setActive = (index) => {
        activeIndex = index;
        slides.forEach((slide, i) => slide.classList.toggle('is-idle', i !== index));
        if (currentEl) currentEl.textContent = String(index + 1).padStart(2, '0');
      };
      const goTo = (index) => {
  const wrapped = (index + slides.length) % slides.length;
  const targetSlide = slides[wrapped];
  const targetLeft = targetSlide.offsetLeft - (track.clientWidth - targetSlide.clientWidth) / 2;
  track.scrollTo({ left: targetLeft, behavior: 'smooth' });
};

      if (prevBtn) prevBtn.addEventListener('click', () => goTo(activeIndex - 1));
      if (nextBtn) nextBtn.addEventListener('click', () => goTo(activeIndex + 1));

      // تحديد الشريحة الأكثر ظهورًا حاليًا (سواء بالأزرار أو بالسحب اليدوي)
      if ('IntersectionObserver' in window) {
        const ratios = new Map();
        const slideObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => ratios.set(entry.target, entry.intersectionRatio));
          let bestIndex = activeIndex;
          let bestRatio = 0;
          slides.forEach((slide, i) => {
            const r = ratios.get(slide) || 0;
            if (r > bestRatio) { bestRatio = r; bestIndex = i; }
          });
          if (bestRatio > 0) setActive(bestIndex);
        }, { root: track, threshold: [0, 0.25, 0.5, 0.75, 1] });
        slides.forEach((slide) => slideObserver.observe(slide));
      } else {
        setActive(0);
      }

      // Autoplay هادئ: يتوقف عند تمرير الفأرة أو اللمس، ويعود بعدها
      let autoplayTimer = null;
      const startAutoplay = () => {
        stopAutoplay();
        autoplayTimer = setInterval(() => goTo(activeIndex + 1), 4200);
      };
      const stopAutoplay = () => { if (autoplayTimer) clearInterval(autoplayTimer); };

      slider.addEventListener('mouseenter', stopAutoplay);
      slider.addEventListener('mouseleave', startAutoplay);
      slider.addEventListener('touchstart', stopAutoplay, { passive: true });
      slider.addEventListener('touchend', () => setTimeout(startAutoplay, 2500), { passive: true });

      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        startAutoplay();
      }
    }
  } catch (err) { console.error('Activities slider error:', err); }

  /* -----------------------------------------------------------------------
     4.8) الفنادق: مصفوفة بيانات واحدة + عرض وفلترة
        لتعديل أي فندق (الاسم، الوصف، الصورة) عدّل القيم في مصفوفة "hotels"
        أدناه فقط — لا حاجة للمس HTML. حقل "image" متروك فارغًا (null) لأنه
        لا توجد بعد صور فعلية مؤكدة لهذه الفنادق في المشروع (راجع تقرير
        الصور المرفق في الرد). بمجرد توفر صورة حقيقية لفندق، ضع اسم ملفها في
        assets/img/hotels/ وامنحه هنا، وستظهر تلقائيًا بدل الشكل البديل.

        ملاحظة على الأسماء: بعض الفنادق غيّرت علامتها التجارية بعد خروج
        سلاسل غربية من روسيا. الأسماء أدناه تعكس ما تم التحقق منه وقت كتابة
        هذا الكود؛ الحقل "formerly" يُستخدم فقط عند وجود تغيير مؤكد في الاسم.
        فنادق معدودة ما زالت تحتاج تأكيدًا نهائيًا قبل النشر — مُشار إليها في
        التقرير النهائي، وليس بأي شكل داخل الموقع نفسه حتى لا يُلبس المستخدم.
     ----------------------------------------------------------------------- */
  try {
    const hotels = [
      // ---------------------------------------------------------------- موسكو
       { city: 'Moscow', name: 'Four Seasons Hotel Moscow', formerly: null, category: 'فندق فاخر', desc: 'بجوار الميدان الأحمر والكرملين، بموقع مركزي مميز.', image: src="assets/img/Four Seasons Hotel Moscow.jpg" },
      { city: 'Moscow', name: 'The Carlton, Moscow', formerly: 'The Ritz-Carlton Moscow', category: 'فندق فاخر', desc: 'فندق فاخر في قلب موسكو، على مقربة من الميدان الأحمر.', image: src="assets/img/carleton.jpg" },
      { city: 'Moscow', name: 'Metropol Moscow', formerly: null, category: 'فندق فاخر', desc: 'مقابل مسرح البولشوي، فندق تاريخي بطابع معماري مميز.', image: src="assets/img/metropol.jpg" },
      { city: 'Moscow', name: 'The St. Regis Moscow Nikolskaya', formerly: null, category: 'فندق فاخر', desc: 'فندق فاخر على مقربة من الميدان الأحمر.', image: src="assets/img/The St. Regis Moscow Nikolskaya.jpg" },
      { city: 'Moscow', name: 'Ararat Park Hyatt Moscow', formerly: null, category: '', desc: 'وسط موسكو، قريب من المعالم المركزية.', image: src="assets/img/Ararat Park Hyatt Moscow.jpg" },
      { city: 'Moscow', name: 'Peter 1 Hotel', formerly: null, category: '', desc: 'وسط موسكو، قريب من المعالم المركزية — خيار مناسب لمن يريد موقعًا مركزيًا.', image: src="assets/img/Peter 1 Hotel.jpg" },
      { city: 'Moscow', name: 'Safmar Aurora Luxe', formerly: 'Safmar Aurora Moscow', category: '', desc: 'فندق وسط موسكو بموقع مركزي.', image: src="assets/img/Safmar Aurora Moscow.jpg" },
      { city: 'Moscow', name: 'National Hotel Moscow', formerly: null, category: 'فندق فاخر', desc: 'مقابل الكرملين مباشرة، فندق تاريخي.', image: src="assets/img/National Hotel Moscow.jpg" },
      { city: 'Moscow', name: 'Cosmos Arbat Hotel', formerly: null, category: '', desc: 'بالقرب من منطقة أربات، مناسب للسياحة داخل موسكو.', image: src="assets/img/Cosmos Arbat Hotel.jpg" },
      { city: 'Moscow', name: 'DoubleTree by Hilton Moscow – Arbat', formerly: null, category: '', desc: 'فندق حديث في منطقة أربات.', image: src="assets/img/DoubleTree by Hilton Moscow – Arba.jpg" },
      { city: 'Moscow', name: 'Arbat Stars Hotel', formerly: null, category: '', desc: 'فندق في منطقة أربات.', image: src="assets/img/Arbat Stars Hotel.jpg" },
      { city: 'Moscow', name: 'Intermark Residence', formerly: null, category: '', desc: 'شقق فندقية مناسبة للعائلات والإقامات الطويلة.', image: src="assets/img/Intermark Residence.jpg" },
      { city: 'Moscow', name: 'Pentahotel Moscow, Arbat', formerly: null, category: '', desc: 'تصميم عصري وموقع مركزي.', image: src="assets/img/Pentahotel Moscow, Arbat.jpg" },
      { city: 'Moscow', name: 'Glenver Garden Hotel', formerly: null, category: '', desc: 'فندق في موسكو.', image: src="assets/img/Glenver Garden Hotel.jpg" },
      { city: 'Moscow', name: 'Swissôtel Krasnye Holmy Moscow', formerly: null, category: '', desc: 'إطلالات بانورامية وموقع قريب من نهر موسكفا.', image: src="assets/img/Swissôtel Krasnye Holmy Moscow.jpg" },
      { city: 'Moscow', name: 'Radisson Collection Hotel Moscow', formerly: null, category: 'فندق فاخر', desc: 'فندق فاخر في مبنى تاريخي مميز، على نهر موسكفا.', image: src="assets/img/Radisson Collection Hotel Moscow.jpg" },
      { city: 'Moscow', name: 'Artcourt Moscow Center Hotel', formerly: null, category: '', desc: 'فندق في وسط موسكو.', image: src="assets/img/Artcourt Moscow Center Hotel.jpg" },
      { city: 'Moscow', name: 'The Standard Hotel Moscow', formerly: null, category: '', desc: 'فندق في موسكو.', image: src="assets/img/The Standard Hotel Moscow.jpg" },
      { city: 'Moscow', name: 'Brosko Arbat Hotel', formerly: null, category: '', desc: 'فندق حديث بالقرب من منطقة أربات.', image: src="assets/img/Brosko Arbat Hotel.jpg" },
      // ------------------------------------------------------- سانت بطرسبرغ
      { city: 'Saint Petersburg', name: 'Cosmos St. Petersburg', formerly: null, category: '', desc: 'مناسب للمجموعات والسياحة داخل سانت بطرسبرغ.', image: src="assets/img/Cosmos St. Petersburg.jpg" },
      { city: 'Saint Petersburg', name: 'Cosmos Selection St. Petersburg', formerly: null, category: '', desc: 'فئة أعلى ضمن نفس المجموعة، في سانت بطرسبرغ.', image: src="assets/img/Cosmos Selection St. Petersburg.jpg" },
    ];

    const hotelsGrid = document.getElementById('hotelsGrid');
    const hotelsFilter = document.getElementById('hotelsFilter');

    if (hotelsGrid) {
      const cityLabels = { Moscow: 'موسكو', 'Saint Petersburg': 'سانت بطرسبرغ' };
      const waBase = 'https://wa.me/79659262292?text=';

      const initialOf = (name) => (name.trim().charAt(0) || '؟').toUpperCase();

      const buildCard = (hotel) => {
        const formerlyHtml = hotel.formerly
          ? `<span class="hotel-card-formerly">Formerly ${hotel.formerly}</span>` : '';
        const categoryHtml = hotel.category
          ? `<span class="hotel-card-category">${hotel.category}</span>` : '';
        const mediaHtml = hotel.image
          ? `<img src="${hotel.image}" alt="${hotel.name}" loading="lazy">`
          : `<div class="hotel-card-media-fallback">
               <span class="fallback-initial">${initialOf(hotel.name)}</span>
               <small>الصورة قيد الإضافة</small>
             </div>`;
        const waText = encodeURIComponent(`مرحبًا، أرغب في طلب حجز في ${hotel.name}.`);

        const card = document.createElement('div');
        card.className = 'hotel-card';
        card.dataset.city = hotel.city;
        card.innerHTML = `
          <div class="hotel-card-media${hotel.image ? '' : ' is-placeholder'}">
            <span class="hotel-card-city-badge">${cityLabels[hotel.city] || hotel.city}</span>
            ${mediaHtml}
          </div>
          <div class="hotel-card-body">
            <span class="hotel-card-name">${hotel.name}</span>
            ${formerlyHtml}
            ${categoryHtml}
            <p class="hotel-card-desc">${hotel.desc}</p>
            <a class="hotel-card-cta" href="${waBase}${waText}" target="_blank" rel="noopener">اطلب الحجز</a>
          </div>`;
        return card;
      };

      // يبني مجموعة واحدة لكل مدينة (عنوان المدينة + شبكة بطاقاتها)
      const cities = ['Moscow', 'Saint Petersburg'];
      cities.forEach((city) => {
        const group = document.createElement('div');
        group.className = 'hotels-city-group';
        group.dataset.cityGroup = city;

        const heading = document.createElement('h3');
        heading.className = 'hotels-city-heading';
        heading.textContent = cityLabels[city];
        group.appendChild(heading);

        const grid = document.createElement('div');
        grid.className = 'hotels-city-grid';
        hotels.filter((h) => h.city === city).forEach((h) => grid.appendChild(buildCard(h)));
        group.appendChild(grid);

        hotelsGrid.appendChild(group);
      });

      // الفلترة: الكل / موسكو / سانت بطرسبرغ
      if (hotelsFilter) {
        hotelsFilter.addEventListener('click', (e) => {
          const btn = e.target.closest('.hotels-filter-btn');
          if (!btn) return;
          const city = btn.dataset.city;

          hotelsFilter.querySelectorAll('.hotels-filter-btn').forEach((b) => b.classList.toggle('is-active', b === btn));
          hotelsGrid.querySelectorAll('.hotels-city-group').forEach((group) => {
            const show = city === 'all' || group.dataset.cityGroup === city;
            group.classList.toggle('is-hidden', !show);
          });
        });
      }
    }
  } catch (err) { console.error('Hotels render error:', err); }

  /* -----------------------------------------------------------------------
     5) المشهد الأخير (Final Scene): دخول سينمائي متسلسل
        نفس المبدأ: الصورة والعنوان والنص والزر مرئيون دائمًا (transform فقط
        في CSS)، وهذا الكود يضيف فقط تسلسل الحركة الاختياري.
     ----------------------------------------------------------------------- */
  try {
    const finalScene = document.getElementById('finalScene');
    if (finalScene) {
      const media = finalScene.querySelector('.final-scene-media img');
      const title = finalScene.querySelector('.final-scene-title');
      const text = finalScene.querySelector('.final-scene-text');
      const button = finalScene.querySelector('.final-scene-content .btn');
      if (media) media.classList.add('media-reveal');

      const playSequence = () => {
        if (media) media.classList.add('is-visible');
        setTimeout(() => title && title.classList.add('is-visible'), 350);
        setTimeout(() => text && text.classList.add('is-visible'), 650);
        setTimeout(() => button && button.classList.add('is-visible'), 900);
      };

      if ('IntersectionObserver' in window) {
        const sceneObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              playSequence();
              sceneObserver.disconnect();
            }
          });
        }, { threshold: 0.35 });
        sceneObserver.observe(finalScene);
      } else {
        playSequence();
      }
    }
  } catch (err) { console.error('Final scene reveal error:', err); }

  /* -----------------------------------------------------------------------
     6) الفيديو: تشغيل مؤجل عند دخول الهيرو لمجال الرؤية
     ----------------------------------------------------------------------- */
  try {
    const heroVideo = document.getElementById('heroVideo');
    if (heroVideo) {
      const loadAndPlay = () => {
        if (heroVideo.getAttribute('preload') !== 'auto') heroVideo.setAttribute('preload', 'auto');
        heroVideo.play().catch(() => { /* التشغيل التلقائي قد يُمنع في بعض المتصفحات */ });
      };
      if ('IntersectionObserver' in window) {
        const videoObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) { loadAndPlay(); videoObserver.disconnect(); }
          });
        }, { threshold: 0.25 });
        videoObserver.observe(heroVideo);
      } else {
        loadAndPlay();
      }
    }
  } catch (err) { console.error('Hero video error:', err); }

  /* -----------------------------------------------------------------------
     7) سنة الحقوق في الفوتر
     ----------------------------------------------------------------------- */
  try {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  } catch (err) { console.error('Footer year error:', err); }

});