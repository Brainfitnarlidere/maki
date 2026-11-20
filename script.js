/* Maki Derneği - Site Script */
(function () {
    // Supabase "anon" anahtarı tarayıcıda görünmek üzere tasarlanmıştır.
    // Güvenlik, Supabase panelindeki RLS kurallarına bağlıdır:
    // "volunteers" tablosunda anon rolüne yalnızca INSERT izni verilmelidir.
    const SUPABASE_URL = 'https://ararahrvohxrtcmcutad.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyYXJhaHJ2b2h4cnRjbWN1dGFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMzc5NzUsImV4cCI6MjA5MjcxMzk3NX0.8UGKd1V-7qNgIQfdICVqLjBPc1KYpXLhoWhTVXst-i8';

    const NAV_OFFSET = 80;

    const setStatus = (el, text, type) => {
        if (!el) return;
        el.textContent = text;
        el.className = el.className.replace(/\s*is-(success|error)/g, '') + (type ? ' is-' + type : '');
    };

    // --- IBAN kopyalama (CSP uyumlu: inline onclick yerine event listener) ---
    const initIbanCopy = () => {
        const box = document.getElementById('ibanBox');
        const text = document.getElementById('ibanText');
        const status = document.getElementById('ibanStatus');
        if (!box || !text) return;

        const fallbackCopy = (value) => {
            const ta = document.createElement('textarea');
            ta.value = value;
            ta.setAttribute('readonly', '');
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            let ok = false;
            try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
            document.body.removeChild(ta);
            return ok;
        };

        let timer;
        box.addEventListener('click', async () => {
            const value = text.textContent.trim();
            let ok = false;
            try {
                await navigator.clipboard.writeText(value);
                ok = true;
            } catch (e) {
                ok = fallbackCopy(value);
            }
            if (ok) {
                box.classList.add('copied');
                setStatus(status, 'IBAN kopyalandı! Bağışınız için teşekkür ederiz.', 'success');
            } else {
                setStatus(status, 'Kopyalanamadı, lütfen IBAN numarasını elle seçip kopyalayın.', 'error');
            }
            clearTimeout(timer);
            timer = setTimeout(() => {
                box.classList.remove('copied');
                setStatus(status, '', '');
            }, 4000);
        });
    };

    // --- Kaydırınca beliren animasyonlar ---
    const initReveal = () => {
        const targets = document.querySelectorAll('.hero-content, .about-text, .about-img, .project-card, .contact-info, .bank-card, .qr-card');
        if (!('IntersectionObserver' in window)) {
            targets.forEach(el => el.classList.add('show'));
            return;
        }
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        targets.forEach(el => observer.observe(el));
    };

    // --- Sayfa içi yumuşak kaydırma ---
    const initSmoothScroll = () => {
        document.querySelectorAll('a[href^="#"]').forEach(a => {
            a.addEventListener('click', function (e) {
                const id = this.getAttribute('href');
                if (id === '#') return;
                const el = document.querySelector(id);
                if (!el) return;
                e.preventDefault();
                window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET, behavior: 'smooth' });
                history.replaceState(null, '', id);
            });
        });
    };

    // --- Mobil menü ---
    const initMenu = () => {
        const toggle = document.querySelector('.menu-toggle');
        const links = document.querySelector('.nav-links');
        if (!toggle || !links) return;

        const setOpen = (open) => {
            links.classList.toggle('active', open);
            toggle.classList.toggle('open', open);
            toggle.setAttribute('aria-expanded', String(open));
            toggle.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
        };

        toggle.addEventListener('click', () => setOpen(!links.classList.contains('active')));
        links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && links.classList.contains('active')) {
                setOpen(false);
                toggle.focus();
            }
        });
    };

    // --- Telefon biçimlendirme: 0XXX XXX XX XX ---
    const initPhoneMask = () => {
        const input = document.querySelector('input[name="phone"]');
        if (!input) return;
        input.addEventListener('input', e => {
            let v = e.target.value.replace(/\D/g, '').substring(0, 11);
            if (v.length > 0 && v[0] !== '0') v = ('0' + v).substring(0, 11);
            let f = '';
            if (v.length > 0) {
                f = v.substring(0, 4);
                if (v.length > 4) f += ' ' + v.substring(4, 7);
                if (v.length > 7) f += ' ' + v.substring(7, 9);
                if (v.length > 9) f += ' ' + v.substring(9, 11);
            }
            e.target.value = f;
        });
    };

    // --- Gönüllü formu ---
    const initVolunteerForm = () => {
        const form = document.getElementById('volunteerForm');
        if (!form) return;
        const status = document.getElementById('formStatus');
        const button = form.querySelector('button[type="submit"]');
        const clean = s => (s || '').replace(/[<>]/g, '').trim();

        let client = null;
        const getClient = () => {
            if (!client && typeof supabase !== 'undefined') {
                client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            }
            return client;
        };

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (form.querySelector('[name="honeypot"]').value) return;

            const name = clean(form.fullName.value);
            const email = clean(form.email.value);
            const phone = clean(form.phone.value);
            const message = clean(form.message.value);
            const interests = Array.from(form.querySelectorAll('input[name="interest"]:checked')).map(cb => cb.value);
            const consent = form.kvkk.checked;

            let error = '';
            if (!name) error = 'Lütfen adınızı ve soyadınızı yazın.';
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) error = 'Lütfen geçerli bir e-posta adresi yazın.';
            else if (phone.length > 0 && phone.length < 14) error = 'Telefon numarası eksik görünüyor (05XX XXX XX XX).';
            else if (interests.length === 0) error = 'Lütfen bize nasıl katılmak istediğinizi seçin.';
            else if (!message) error = 'Lütfen kısa bir mesaj yazın.';
            else if (!consent) error = 'Devam etmek için KVKK Aydınlatma Metni onayını işaretleyin.';

            if (error) {
                setStatus(status, error, 'error');
                return;
            }

            const db = getClient();
            if (!db) {
                setStatus(status, 'Form şu anda kullanılamıyor. Lütfen WhatsApp veya e-posta ile ulaşın.', 'error');
                return;
            }

            const originalText = button.textContent;
            button.textContent = 'Gönderiliyor...';
            button.disabled = true;
            setStatus(status, '', '');

            try {
                const { error: dbError } = await db.from('volunteers').insert([{
                    full_name: name.substring(0, 100),
                    email: email.substring(0, 100),
                    phone: phone.substring(0, 20),
                    interests: interests.join(', '),
                    message: message.substring(0, 1000),
                    created_at: new Date().toISOString()
                }]);
                if (dbError) throw dbError;
                setStatus(status, 'Başvurunuz alındı, teşekkür ederiz! En kısa sürede sizinle iletişime geçeceğiz.', 'success');
                form.reset();
            } catch (err) {
                setStatus(status, 'Bir hata oluştu. Lütfen tekrar deneyin ya da WhatsApp üzerinden ulaşın.', 'error');
            } finally {
                button.textContent = originalText;
                button.disabled = false;
            }
        });
    };

    const initYear = () => {
        const el = document.getElementById('year');
        if (el) el.textContent = new Date().getFullYear();
    };

    const init = () => {
        initIbanCopy();
        initReveal();
        initSmoothScroll();
        initMenu();
        initPhoneMask();
        initVolunteerForm();
        initYear();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
