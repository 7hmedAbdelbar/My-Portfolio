// تعريف المتغيرات العامة للحالة
let currentLang = 'en';
let translations = {};
let projectsList = [];
let certsList = []; 
let dataLoaded = false; // متغير جديد لتتبع حالة التحميل
// تعريف المتغيرات العامة للحالة (أضف هذا)
let currentGalleryImages = [];
let currentImageIndex = 0;

// جلب العناصر الأساسية من DOM
const langToggle = document.getElementById('lang-toggle');
const body = document.body;
const projectsContainer = document.querySelector('.projects-grid');
// العناصر الجديدة لمنطق الهيدر الذكي
const mobileHeader = document.querySelector('header');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
let lastScrollTop = 0; 
const scrollThreshold = 50; 


// Intersection Observer: لتطبيق تأثير Fade-in عند التمرير
// Intersection Observer: لتطبيق تأثير Fade-in عند التمرير
// Intersection Observer: لتطبيق تأثير Fade-in عند التمرير (القديم)
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            // 🛑 تأكد من إزالة استدعاء updateNavActiveState(entry.target.id, true); من هنا
        } else {
            entry.target.classList.remove('fade-in'); 
        }
    });
}, {
    threshold: 0.1 // عتبة منخفضة مناسبة لتأثير الظهور
});


// ... (الكود الخاص بـ 'observer' موجود هنا)

// 🌟 المراقب الجديد لتحديد القسم النشط 🌟
// هذا المراقب يحدد منطقة التركيز (Focus Zone) لتحديد القسم النشط بدقة
const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // عندما يدخل القسم إلى منطقة التركيز، نقوم بتحديث الحالة
            updateNavActiveState(entry.target.id, true);
        }
    });
}, {
    // تحديد منطقة التركيز (Focus Zone) في أعلى الشاشة:
    // "-80px" من الأعلى: لترك مساحة للهيدر الثابت (ارتفاع الهيدر لديك)
    // "-80%" من الأسفل: لضمان أن القسم لا يعتبر نشطاً إلا عندما يكون في الجزء العلوي من الشاشة
    rootMargin: "-80px 0px -80% 0px", 
    threshold: 0 
});

// 1. تحميل ملف البيانات (data.json)
async function loadData() {
    try {
        const response = await fetch('data.json');
        
        if (!response.ok) {
            console.error('Failed to load data.json. Check file path or server status.', response.status);
            return; 
        }

        const data = await response.json();
        
        translations = data;
        projectsList = data.projects_list || [];
        certsList = data.certs_list || []; 
        dataLoaded = true; // تم التحميل بنجاح
        
        // تطبيق اللغة الافتراضية بعد التحميل الناجح
        setLanguage(currentLang); 
        
        // تطبيق الـ Observer على جميع العناصر التي تحتاج إلى تأثير ظهور
        document.querySelectorAll('.initial-hidden').forEach((el) => {
            observer.observe(el);
        });
        
    } catch (error) {
        console.error("Critical Error during data loading or parsing (check JSON format):", error);
    }
}

// 2. تطبيق اللغة والبيانات على الصفحة
function setLanguage(lang) {
    currentLang = lang;
    
    // أ) تغيير اتجاه الصفحة (RTL/LTR)
    body.dir = (lang === 'ar') ? 'rtl' : 'ltr';
    body.classList.toggle('ltr-mode', lang === 'en');

    // ب) تغيير نص زر التبديل
    if (lang === 'ar') {
        langToggle.textContent = 'English';
        langToggle.dataset.lang = 'en';
    } else {
        langToggle.textContent = 'عربي';
        langToggle.dataset.lang = 'ar';
    }

    // ج) ترجمة النصوص باستخدام data-translate
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.dataset.translate;
        if (translations[lang] && translations[lang][key]) { 
            element.textContent = translations[lang][key];
        }
    });

    // د) ترجمة الـ Placeholders (نصوص النماذج)
    document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
        const key = element.dataset.translatePlaceholder;
        if (translations[lang] && translations[lang][key]) {
            element.placeholder = translations[lang][key];
        }
    });

    // هـ) تطبيق الإعدادات العامة (الروابط والصور الثابتة)
    const settings = translations.global_settings || {};
    
    // الصورة الشخصية
    const profileImg = document.getElementById('profile-img');
    if (profileImg && settings.profile_img_path) {
        profileImg.src = settings.profile_img_path;
    }

    // رابط CV
    const cvLink = document.getElementById('cv-link');
    if (cvLink && settings.cv_link) {
        cvLink.href = settings.cv_link;
    }
    
    // روابط أيقونات السوشيال ميديا (للهيرو وقسم التواصل)
    
    const phoneNumber = settings.phone_number;
    // استخدام الدالة لمرة واحدة لعدم تكرار الكود
    const telLink = phoneNumber ? `tel:${phoneNumber.replace(/\s/g, '')}` : '#';

    // قسم الهيرو
    const linkedinIconHero = document.getElementById('linkedin-icon');
    if (linkedinIconHero) linkedinIconHero.href = settings.linkedin_link || '#';
    
    const githubIconHero = document.getElementById('github-icon');
    if (githubIconHero) githubIconHero.href = settings.github_link || '#';
    
    const emailIconHero = document.getElementById('email-icon');
    if (emailIconHero) emailIconHero.href = settings.email_link || 'mailto:';
    
    const phoneIconHero = document.getElementById('phone-icon');
    if (phoneIconHero) phoneIconHero.href = telLink;


    // قسم التواصل 
    const linkedinIconContact = document.getElementById('linkedin-icon-contact');
    if (linkedinIconContact) linkedinIconContact.href = settings.linkedin_link || '#';

    const githubIconContact = document.getElementById('github-icon-contact');
    if (githubIconContact) githubIconContact.href = settings.github_link || '#';
    
    const emailIconContact = document.getElementById('email-icon-contact');
    if (emailIconContact) emailIconContact.href = settings.email_link || 'mailto:';

    const phoneIconContact = document.getElementById('phone-icon-contact');
    if (phoneIconContact) phoneIconContact.href = telLink;


    // و) عرض المشاريع والشهادات باللغة الجديدة
    loadAndRenderProjects(); 
    loadAndRenderCertifications(); 
}

// 3. وظيفة عرض المشاريع ديناميكياً
function loadAndRenderProjects() {
    if (!projectsContainer) return;
    
    projectsContainer.innerHTML = ''; 
    
    const lang = currentLang;
    const projectLinkText = translations[lang] ? translations[lang].project_link_text : 'View Link';

    projectsList.forEach((project, index) => { // 🌟 لاحظ إضافة index 🌟
        const titleKey = `${lang}_title`;
        const descKey = `${lang}_desc`;
        
        // 🌟 الخطوة 1: تجهيز قائمة مسارات الصور كنص JSON 🌟
        // هذا هو الجزء الذي يحمل قائمة الصور للتمرير إلى دالة openGallery
        const galleryImagesJSON = project.gallery_images ? JSON.stringify(project.gallery_images) : '[]';

        const card = document.createElement('div');
        card.className = 'project-card initial-hidden';
        
        card.innerHTML = `
            <img 
                src="${project.thumbnail || project.img}" 
                alt="${project[titleKey]}"
                class="project-thumbnail"
                data-gallery='${galleryImagesJSON}' 
                onclick="openProjectGallery(this)" >
            
            <div style="padding: 15px;">
                <h3>${project[titleKey]}</h3>
                <p>${project[descKey]}</p>
                <div class="project-tags">
                    ${project.tags.map(tag => `<span>${tag}</span>`).join('')}
                </div>
                <a href="${project.link}" target="_blank" class="btn primary-btn project-link" style="margin-top: 10px;">${projectLinkText}</a>
            </div>
        `;
        
        projectsContainer.appendChild(card);
        observer.observe(card); 
    });
}


// 4. وظيفة عرض الشهادات ديناميكياً
function loadAndRenderCertifications() {
    const certsContainer = document.querySelector('.certs-grid');
    if (!certsContainer) return;
    
    certsContainer.innerHTML = ''; 
    
    const lang = currentLang;
    const certLinkText = translations[lang] ? translations[lang].cert_link_text : 'View Certificate';

    certsList.forEach(cert => {
        const titleKey = `${lang}_title`;
        const descKey = `${lang}_desc`;

        const card = document.createElement('div');
        card.className = 'cert-card initial-hidden';
        
        card.innerHTML = `
            <i class="${cert.icon}"></i>
            <h3>${cert[titleKey]}</h3>
            <p>${cert[descKey]}</p>
            <a href="${cert.link}" target="_blank">${certLinkText}</a>
        `;
        
        certsContainer.appendChild(card);
        observer.observe(card); 
    });
}


// وظيفة معالجة حدث التمرير على الموبايل
function handleMobileScroll() {
    // نطبق هذا المنطق فقط على الشاشات الصغيرة
    if (window.innerWidth >= 768) {
        mobileHeader.classList.remove('hidden'); // تأكد من إظهاره على الديسكتوب
        return; 
    }

    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    if (currentScroll > lastScrollTop && currentScroll > mobileHeader.offsetHeight + scrollThreshold) {
        // التمرير للأسفل: إخفاء الهيدر (بشرط أن يكون قد مر جزء منه بالفعل)
        mobileHeader.classList.add('hidden');
    } else if (currentScroll < lastScrollTop) {
        // التمرير للأعلى: إظهار الهيدر
        mobileHeader.classList.remove('hidden');
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // لتجنب القيم السالبة
}

// وظيفة لمعالجة ضغطة زر الإظهار العائم
function handleMenuToggleClick() {
    mobileHeader.classList.remove('hidden');
    // لجعله يعود إلى أعلى الصفحة بمجرد إظهاره
    document.getElementById('hero').scrollIntoView({ behavior: 'smooth' });
}


// 5. معالجة الأحداث عند بدء تشغيل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    
const menuToggle = document.getElementById('menu-toggle');
    const navList = document.querySelector('nav ul');
    const navLinks = document.querySelectorAll('nav ul li a');

    // تفعيل زر القائمة (Hamburger Menu)
    if (menuToggle && navList) {
        menuToggle.addEventListener('click', function() {
            // تبديل فئة 'open' لإظهار/إخفاء القائمة في CSS
            navList.classList.toggle('open');
            // تغيير الأيقونة من بارز إلى إغلاق (X) والعكس
            menuToggle.classList.toggle('fa-bars');
            menuToggle.classList.toggle('fa-times');
        });
    }

    // إغلاق القائمة عند الضغط على أي رابط
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navList.classList.contains('open')) {
                navList.classList.remove('open');
                menuToggle.classList.remove('fa-times');
                menuToggle.classList.add('fa-bars');
            }
        });
    });

    // تحديث العام في التذييل
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
    
    // ربط حدث الضغط على زر تبديل اللغة
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            const newLang = langToggle.dataset.lang;
            setLanguage(newLang);
        });
    }

    // معالجة نموذج التواصل (محاكاة فقط)
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            formStatus.style.color = 'var(--primary-color)';
            formStatus.textContent = 'تم استلام رسالتك بنجاح! سأتواصل معك قريباً.';
            setTimeout(() => {
                contactForm.reset();
                formStatus.textContent = '';
            }, 3000);
        });
    }
   const profileImgElement = document.querySelector('.hero img[src*="profile_img_path"]'); 
    
    if (profileImgElement) {
        profileImgElement.addEventListener('click', function() {
            // ** مهم جداً: تصفير قائمة الصور **
            currentGalleryImages = [];
            currentImageIndex = 0;
            openModal(this); 
        });
    }
    // 🌟🌟🌟 إضافة منطق معرض الصور (Gallery Modal) 🌟🌟🌟

    // 1. ربط أزرار التنقل بالدالة changeImage
    // يجب أن تكون الدالة changeImage موجودة في الكود العام بالملف
    const modalNextBtn = document.getElementById("modal-next-btn");
    const modalPrevBtn = document.getElementById("modal-prev-btn");

    if (modalNextBtn) {
        // عند الضغط على زر التالي، نمرر 1 للانتقال للأمام
        modalNextBtn.addEventListener('click', () => changeImage(1)); 
    }
    if (modalPrevBtn) {
        // عند الضغط على زر السابق، نمرر -1 للانتقال للخلف
        modalPrevBtn.addEventListener('click', () => changeImage(-1)); 
    }

    // 2. ربط إغلاق النافذة المنبثقة بالبروفايل
    // هذا الكود مأخوذ من التعديلات السابقة لضمان عمل إغلاق النافذة
    const modal = document.getElementById("image-modal");
    const spanClose = document.getElementsByClassName("close-btn")[0];

    // عند الضغط على زر الإغلاق (X)
    if (spanClose) {
        spanClose.onclick = function() {
            modal.style.display = "none";
        }
    }

    // عند الضغط خارج النافذة المنبثقة
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }

    const sections = document.querySelectorAll('section'); 
    
    sections.forEach(section => {
        observer.observe(section);   // المراقب لتأثير Fade-in
        navObserver.observe(section); // 🌟 المراقب الجديد للحالة النشطة 🌟
    });
    // 🌟 نهاية الإضافة 🌟
});
    
    // بدء تحميل البيانات عند الانتهاء من تحميل DOM
    loadData();
    
    // **محاولة تحميل البيانات مرة أخرى إذا لم تظهر (لحل مشكلة الجوال)**
    setTimeout(() => {
        if (!dataLoaded) {
            console.warn("Data didn't load initially. Trying to re-load...");
            loadData(); // محاولة ثانية
        }
    }, 1000);
    
    // ربط حدث التمرير على الجوال
    window.addEventListener('scroll', handleMobileScroll);
    
    // ربط حدث الضغط على زر الإظهار
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', handleMenuToggleClick);
    }
    // جلب عناصر النافذة المنبثقة
const modal = document.getElementById("image-modal");
const modalImg = document.getElementById("modal-image");
const modalCaption = document.getElementById("modal-caption");
const spanClose = document.getElementsByClassName("close-btn")[0];
const profileImgLink = document.getElementById("profile-img-link"); // الرابط الجديد

// يجب أن يتم وضع هذا الكود بعد تعريف المتغيرات في بداية script.js 

if (profileImgLink) {
    profileImgLink.addEventListener('click', (e) => {
        e.preventDefault(); // منع الرابط من الانتقال لأي مكان
        
        // جلب مسار الصورة من وسم الصورة الفعلي (لأنه يتم تحديثه بواسطة loadData)
        const profileImgElement = document.getElementById('profile-img');
        const imgPath = profileImgElement.src;
        
        modal.style.display = "block"; // إظهار النافذة
        modalImg.src = imgPath; // وضع مسار الصورة في النافذة
        
        // جلب النص البديل للعنوان
        modalCaption.innerHTML = profileImgElement.alt;
    });
}

// عند الضغط على زر الإغلاق (X)
if (spanClose) {
    spanClose.onclick = function() {
        modal.style.display = "none";
    }
}

// عند الضغط خارج النافذة المنبثقة
window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
}



// الدوال الجديدة للتحكم بالمعرض (هذه هي النسخة الموحدة والصحيحة)
function openProjectGallery(imgElement) {
    // جلب عناصر الـ Modal
    const modal = document.getElementById("image-modal");
    const modalImg = document.getElementById("modal-image");
    const modalCaption = document.getElementById("modal-caption");
    const nextBtn = document.getElementById("modal-next-btn");
    const prevBtn = document.getElementById("modal-prev-btn");
    
    // محاولة قراءة قائمة مسارات الصور من خاصية data-gallery
    const imagesJSON = imgElement.getAttribute('data-gallery');

    // **المنطق الرئيسي:** إذا لم نجد قائمة صور، نعتبرها صورة واحدة (الصورة الشخصية)
    if (!imagesJSON) {
        currentGalleryImages = [imgElement.src];
    } else {
        // إذا وجدنا قائمة صور (مشروع)، نقوم بتحويلها
        try {
            currentGalleryImages = JSON.parse(imagesJSON);
        } catch (e) {
            console.error("Error parsing gallery images JSON:", e);
            return;
        }
    }

    if (currentGalleryImages.length === 0) return;

    currentImageIndex = 0; // البدء من الصورة الأولى
    
    // عرض الصورة الأولى وإظهار الـ Modal
    modalImg.src = currentGalleryImages[currentImageIndex];
    modal.style.display = "block";
    
    // **هذا هو المفتاح:** إظهار الأزرار فقط إذا كان عدد الصور أكبر من 1.
    // للصورة الشخصية، currentGalleryImages.length هو 1، وبالتالي سيتم إخفاؤها.
    const displayStyle = (currentGalleryImages && currentGalleryImages.length > 1) ? "block" : "none";    nextBtn.style.display = displayStyle;
    prevBtn.style.display = displayStyle;
    
    // تحديث العنوان
    modalCaption.innerHTML = imgElement.alt;
}

function changeImage(step) {
    if (currentGalleryImages.length <= 1) return; // لا حاجة للتغيير

    let newIndex = currentImageIndex + step;

    // عمل حلقة (Loop)
    if (newIndex >= currentGalleryImages.length) {
        newIndex = 0; 
    } else if (newIndex < 0) {
        newIndex = currentGalleryImages.length - 1; 
    }

    currentImageIndex = newIndex;
    document.getElementById("modal-image").src = currentGalleryImages[currentImageIndex];
    // يمكنك تحديث الشرح هنا إذا أردت
}


function updateNavActiveState(targetId, isIntersecting) {
    // 1. إزالة فئة 'active' من كل الروابط.
    // هذا يضمن أن رابطاً واحداً فقط يكون ملوناً في كل مرة.
    document.querySelectorAll('header nav ul li a').forEach(link => {
        link.classList.remove('active');
    });

    // 2. إذا كان القسم الجديد مرئياً (isIntersecting == true)...
    if (isIntersecting) {
        // ... نبحث عن الرابط المطابق. مثال: إذا كان targetId هو 'about'،
        // نبحث عن <a href="#about">
        const activeLink = document.querySelector(`header nav ul li a[href="#${targetId}"]`);
        
        // إذا وجدنا الرابط...
        if (activeLink) {
            // ... نضيف له فئة 'active'
            activeLink.classList.add('active');
        }
    }
}

