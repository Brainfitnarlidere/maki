/* Maki Derneği - Protected Script */
window.copyIban = () => {
    const t = document.getElementById('ibanText').innerText;
    navigator.clipboard.writeText(t).then(() => {
        alert('IBAN kopyalandı! Bağışınız için teşekkür ederiz.');
    });
};

(function() {
    const _0xUrl = 'https://ararahrvohxrtcmcutad.supabase.co';
    const _0xKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyYXJhaHJ2b2h4cnRjbWN1dGFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMzc5NzUsImV4cCI6MjA5MjcxMzk3NX0.8UGKd1V-7qNgIQfdICVqLjBPc1KYpXLhoWhTVXst-i8';

    document.addEventListener('DOMContentLoaded', () => {
        const _scr = () => {
            const o = { threshold: 0.1 };
            const ob = new IntersectionObserver(e => {
                e.forEach(t => { if (t.isIntersecting) t.target.classList.add('show'); });
            }, o);
            document.querySelectorAll('.hero-content, .about-text, .about-img, .project-card, .contact-info, .bank-card, .qr-card').forEach(el => ob.observe(el));
        };

        const _sm = () => {
            document.querySelectorAll('a[href^="#"]').forEach(a => {
                a.addEventListener('click', function(e) {
                    e.preventDefault();
                    const t = this.getAttribute('href');
                    if (t === '#') return;
                    const el = document.querySelector(t);
                    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
                });
            });
        };

        const _mn = () => {
            const t = document.querySelector('.menu-toggle'), l = document.querySelector('.nav-links');
            if (t && l) {
                t.addEventListener('click', () => { l.classList.toggle('active'); t.classList.toggle('open'); });
                document.querySelectorAll('.nav-links a').forEach(a => {
                    a.addEventListener('click', () => { l.classList.remove('active'); t.classList.remove('open'); });
                });
            }
        };

        const _ph = () => {
            const i = document.querySelector('input[name="phone"]');
            if (!i) return;
            i.addEventListener('input', e => {
                let v = e.target.value.replace(/\D/g, '');
                if (v.length > 0 && v[0] !== '0') v = '0' + v;
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

        const _san = s => {
            if (!s) return '';
            const t = document.createElement('div');
            t.textContent = s;
            return t.innerHTML.replace(/[<>]/g, '');
        };

        const _vlt = async () => {
            if (typeof supabase === 'undefined') return;
            const c = supabase.createClient(_0xUrl, _0xKey);
            const f = document.getElementById('volunteerForm');
            if (!f) return;
            f.addEventListener('submit', async (e) => {
                e.preventDefault();
                const b = f.querySelector('button[type="submit"]'), oT = b.innerText;
                const hp = f.querySelector('[name="honeypot"]')?.value;
                if (hp) return;
                const n = _san(f.querySelector('[name="fullName"]').value);
                const em = _san(f.querySelector('[name="email"]').value);
                const ph = _san(f.querySelector('[name="phone"]').value);
                const ms = _san(f.querySelector('[name="message"]').value);
                const its = Array.from(f.querySelectorAll('input[name="interest"]:checked')).map(cb => _san(cb.value));
                if (its.length === 0 || (ph.length > 0 && ph.length < 14) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
                    alert('Lütfen tüm alanları doğru doldurunuz.');
                    return;
                }
                b.innerText = 'Gönderiliyor...';
                b.disabled = true;
                try {
                    const { error } = await c.from('volunteers').insert([{
                        full_name: n.substring(0, 100),
                        email: em.substring(0, 100),
                        phone: ph.substring(0, 20),
                        interests: its.join(', '),
                        message: ms.substring(0, 1000),
                        created_at: new Date().toISOString()
                    }]);
                    if (error) throw error;
                    alert('Başvurunuz alınmıştır, teşekkür ederiz!');
                    f.reset();
                } catch (err) {
                    alert('Bir hata oluştu. Lütfen tekrar deneyin.');
                } finally {
                    b.innerText = oT;
                    b.disabled = false;
                }
            });
        };

        _scr(); _sm(); _mn(); _ph(); _vlt();
    });
})();
